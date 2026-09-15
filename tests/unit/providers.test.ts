import { afterEach, describe, expect, it, vi } from "vitest";

const smtpMock = vi.hoisted(() => {
  type Handler = (...args: unknown[]) => void;
  const responses = ["250-titan\r\n250 AUTH LOGIN\r\n", "334 VXNlcm5hbWU6\r\n", "334 UGFzc3dvcmQ6\r\n", "235 authenticated\r\n", "250 sender ok\r\n", "250 recipient ok\r\n", "354 go ahead\r\n", "250 queued\r\n"];
  const handlers = new Map<string, Handler[]>();
  const writes: string[] = [];
  const emit = (event: string, ...args: unknown[]) => {
    for (const handler of handlers.get(event) || []) handler(...args);
  };
  const socket = {
    setEncoding: vi.fn(),
    setTimeout: vi.fn(),
    on: vi.fn((event: string, handler: Handler) => {
      handlers.set(event, [...(handlers.get(event) || []), handler]);
      return socket;
    }),
    once: vi.fn((event: string, handler: Handler) => {
      const onceHandler = (...args: unknown[]) => {
        socket.off(event, onceHandler);
        handler(...args);
      };
      handlers.set(event, [...(handlers.get(event) || []), onceHandler]);
      return socket;
    }),
    off: vi.fn((event: string, handler: Handler) => {
      handlers.set(
        event,
        (handlers.get(event) || []).filter((item) => item !== handler),
      );
      return socket;
    }),
    write: vi.fn((line: string) => {
      writes.push(line);
      const response = responses.shift();
      if (response) queueMicrotask(() => emit("data", response));
      return true;
    }),
    end: vi.fn(),
  };
  const connect = vi.fn(() => {
    queueMicrotask(() => {
      emit("secureConnect");
      setTimeout(() => emit("data", "220 smtp.titan.email ready\r\n"), 0);
    });
    return socket;
  });
  const reset = () => {
    responses.splice(0, responses.length, "250-titan\r\n250 AUTH LOGIN\r\n", "334 VXNlcm5hbWU6\r\n", "334 UGFzc3dvcmQ6\r\n", "235 authenticated\r\n", "250 sender ok\r\n", "250 recipient ok\r\n", "354 go ahead\r\n", "250 queued\r\n");
    handlers.clear();
    writes.splice(0);
    socket.setEncoding.mockClear();
    socket.setTimeout.mockClear();
    socket.on.mockClear();
    socket.once.mockClear();
    socket.off.mockClear();
    socket.write.mockClear();
    socket.end.mockClear();
    connect.mockClear();
  };
  return { connect, reset, writes };
});

vi.mock("node:tls", () => ({
  default: {
    connect: smtpMock.connect,
  },
  connect: smtpMock.connect,
}));

const originalEnv = { ...process.env };

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) delete process.env[key];
  }
  Object.assign(process.env, originalEnv);
}

describe("provider selection", () => {
  afterEach(() => {
    restoreEnv();
    vi.resetModules();
    vi.clearAllMocks();
    smtpMock.reset();
  });

  it("uses Titan-compatible SMTP when EMAIL_PROVIDER is smtp", async () => {
    process.env.EMAIL_PROVIDER = "smtp";
    process.env.EMAIL_FROM = "LME Pest Solutions <info@example.com>";
    process.env.SMTP_HOST = "smtp.titan.email";
    process.env.SMTP_PORT = "465";
    process.env.SMTP_SECURE = "true";
    process.env.SMTP_USER = "info@example.com";
    process.env.SMTP_PASSWORD = "smtp-secret";
    process.env.PUBLIC_SITE_URL = "https://lme.example.co.uk";

    const { emailProvider } = await import("@/lib/providers");
    const result = await emailProvider.send({
      to: "owner@example.com",
      subject: "Test email",
      html: "<p>Hello</p>",
      text: "Hello",
    });

    expect(result.provider).toBe("smtp");
    expect(smtpMock.connect).toHaveBeenCalledWith({
      host: "smtp.titan.email",
      port: 465,
      servername: "smtp.titan.email",
    });
    expect(smtpMock.writes.join("\n")).toContain("AUTH LOGIN");
    expect(smtpMock.writes.join("\n")).toContain("MAIL FROM:<info@example.com>");
    expect(smtpMock.writes.join("\n")).toContain("RCPT TO:<owner@example.com>");
    expect(smtpMock.writes.join("\n")).toContain("Subject: Test email");
  });

  it("fails fast when SMTP is enabled without a password", async () => {
    process.env.EMAIL_PROVIDER = "smtp";
    process.env.EMAIL_FROM = "LME Pest Solutions <info@example.com>";
    process.env.SMTP_HOST = "smtp.titan.email";
    process.env.SMTP_PORT = "465";
    process.env.SMTP_SECURE = "true";
    process.env.SMTP_USER = "info@example.com";
    delete process.env.SMTP_PASSWORD;

    const { emailProvider } = await import("@/lib/providers");

    await expect(
      emailProvider.send({
        to: "owner@example.com",
        subject: "Test email",
        html: "<p>Hello</p>",
      }),
    ).rejects.toThrow("SMTP email is enabled");
  });
});
