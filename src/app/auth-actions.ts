"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { emailTemplates } from "@/lib/email-templates";
import { env } from "@/lib/env";
import { emailProvider } from "@/lib/providers";
import { checkRateLimit } from "@/lib/rate-limit";

function field(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function newToken() {
  return randomBytes(32).toString("hex");
}

async function saveToken(identifier: string, minutes: number) {
  const token = newToken();
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires: new Date(Date.now() + minutes * 60 * 1000),
    },
  });
  return token;
}

export async function requestPasswordReset(formData: FormData) {
  const email = z.string().email().parse(field(formData, "email").toLowerCase());
  const limit = await checkRateLimit(`password-reset:${email}`, 3, 60 * 60 * 1000);
  if (!limit.ok) redirect("/admin?reset=limited");
  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.passwordHash) {
    const token = await saveToken(`password-reset:${email}`, 60);
    const url = `${env.PUBLIC_SITE_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    await emailProvider.send({ to: email, ...emailTemplates.passwordReset(url) });
    await audit("PASSWORD_RESET_REQUESTED", "User", { entityId: user.id, metadata: { email } });
  }
  redirect("/admin?reset=requested");
}

export async function resetPassword(formData: FormData) {
  const email = z.string().email().parse(field(formData, "email").toLowerCase());
  const token = z.string().min(20).parse(field(formData, "token"));
  const password = z.string().min(10).parse(field(formData, "password"));
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.identifier !== `password-reset:${email}` || record.expires < new Date()) redirect("/reset-password?error=invalid");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.update({ where: { email }, data: { passwordHash, status: "ACTIVE", failedLoginCount: 0, suspendedUntil: null } });
  await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });
  await audit("PASSWORD_RESET_COMPLETED", "User", { entityId: user.id });
  redirect("/admin?reset=complete");
}
