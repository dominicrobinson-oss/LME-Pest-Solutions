import { env } from "@/lib/env";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import tls from "node:tls";

export type EmailMessage = { to: string; subject: string; html: string; text?: string };
export type BankPaymentRequestInput = { amount: number; reference: string; customerEmail?: string };
export type StoredFileInput = { name: string; contentType: string; data: Buffer; ownerId?: string };
export type SmsMessage = { to: string; body: string };

function cleanHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function extractAddress(value: string) {
  const match = value.match(/<([^<>]+)>/);
  return cleanHeader(match?.[1] || value);
}

function foldBody(value: string) {
  return value.replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
}

async function sendSmtpMail(message: EmailMessage) {
  if (!env.SMTP_USER || !env.SMTP_PASSWORD || !env.EMAIL_FROM) throw new Error("SMTP email is enabled but SMTP credentials or EMAIL_FROM are missing.");
  if (!env.SMTP_SECURE) throw new Error("SMTP_SECURE=false is not supported for production email. Use Titan SMTP over SSL/TLS on port 465.");

  const socket = tls.connect({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    servername: env.SMTP_HOST,
  });

  socket.setEncoding("utf8");
  socket.setTimeout(20_000);

  let buffer = "";
  const waitForResponse = () =>
    new Promise<string>((resolve, reject) => {
      const cleanup = () => {
        socket.off("data", onData);
        socket.off("error", onError);
        socket.off("timeout", onTimeout);
      };
      const onData = (chunk: string) => {
        buffer += chunk;
        const lines = buffer.split(/\r?\n/).filter(Boolean);
        const last = lines.at(-1);
        if (last && /^\d{3}\s/.test(last)) {
          const response = buffer;
          buffer = "";
          cleanup();
          resolve(response);
        }
      };
      const onError = (error: Error) => {
        cleanup();
        reject(error);
      };
      const onTimeout = () => {
        cleanup();
        reject(new Error("SMTP connection timed out"));
      };
      socket.on("data", onData);
      socket.on("error", onError);
      socket.on("timeout", onTimeout);
    });

  const command = async (line: string, expected: number[]) => {
    socket.write(`${line}\r\n`);
    const response = await waitForResponse();
    const code = Number(response.slice(0, 3));
    if (!expected.includes(code)) throw new Error(`SMTP command failed with ${code}: ${response.trim()}`);
    return response;
  };

  await new Promise<void>((resolve, reject) => {
    socket.once("secureConnect", resolve);
    socket.once("error", reject);
  });

  const banner = await waitForResponse();
  if (!banner.startsWith("220")) throw new Error(`SMTP server rejected connection: ${banner.trim()}`);

  await command(`EHLO ${env.PUBLIC_SITE_URL ? new URL(env.PUBLIC_SITE_URL).hostname : "localhost"}`, [250]);
  await command("AUTH LOGIN", [334]);
  await command(Buffer.from(env.SMTP_USER).toString("base64"), [334]);
  await command(Buffer.from(env.SMTP_PASSWORD).toString("base64"), [235]);
  await command(`MAIL FROM:<${extractAddress(env.EMAIL_FROM)}>`, [250]);
  await command(`RCPT TO:<${extractAddress(message.to)}>`, [250, 251]);
  await command("DATA", [354]);

  const messageId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@${env.SMTP_HOST}>`;
  const payload = [
    `From: ${cleanHeader(env.EMAIL_FROM)}`,
    `To: ${cleanHeader(message.to)}`,
    `Subject: ${cleanHeader(message.subject)}`,
    `Message-ID: ${messageId}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    foldBody(message.html),
    ".",
  ].join("\r\n");
  await command(payload, [250]);
  socket.write("QUIT\r\n");
  socket.end();
  return { messageId };
}

export const emailProvider = {
  async send(message: EmailMessage) {
    if (env.EMAIL_PROVIDER === "smtp") {
      const response = await sendSmtpMail(message);
      return { id: response.messageId || `email_${Date.now()}`, provider: "smtp", message };
    }
    return { id: `email_stub_${Date.now()}`, provider: "stub", message };
  },
};

export const paymentProvider = {
  async createBankTransferRequest(input: BankPaymentRequestInput) {
    return {
      id: `bank_${input.reference}_${Date.now()}`,
      provider: env.PAYMENT_PROVIDER,
      status: "AWAITING_BANK_TRANSFER",
      reference: input.reference,
      amount: input.amount,
      bankDetails: {
        accountName: env.BANK_ACCOUNT_NAME,
        sortCode: env.BANK_SORT_CODE,
        accountNumber: env.BANK_ACCOUNT_NUMBER,
        notes: env.BANK_PAYMENT_NOTES,
      },
      customerEmail: input.customerEmail,
    };
  },
};

export const storageProvider = {
  async put(input: StoredFileInput) {
    const safeName = input.name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "upload";
    const key = `${Date.now()}-${safeName}`;
    if (env.STORAGE_PROVIDER === "s3") {
      if (!env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) throw new Error("S3 storage is enabled but S3 credentials are missing.");
      const client = new S3Client({
        region: env.S3_REGION,
        endpoint: env.S3_ENDPOINT,
        credentials: { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY },
        forcePathStyle: Boolean(env.S3_ENDPOINT),
      });
      await client.send(new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, Body: input.data, ContentType: input.contentType }));
      const publicBase = env.S3_PUBLIC_BASE_URL || (env.S3_ENDPOINT && `${env.S3_ENDPOINT.replace(/\/$/, "")}/${env.S3_BUCKET}`);
      return { key: `s3/${key}`, url: publicBase ? `${publicBase}/${key}` : `s3://${env.S3_BUCKET}/${key}`, provider: "s3" };
    }
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, key), input.data);
    return { key: `local/${key}`, url: `/uploads/${key}`, provider: env.STORAGE_PROVIDER };
  },
  async signedUrl(key: string) {
    return { url: `/api/documents/${encodeURIComponent(key)}`, expiresIn: 300 };
  },
};

export const smsProvider = {
  async send(message: SmsMessage) {
    return { id: `sms_stub_${Date.now()}`, provider: env.SMS_PROVIDER, message };
  },
};

export const mapsProvider = {
  directionsUrl(postcode: string) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(postcode)}`;
  },
};
