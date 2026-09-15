import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { emailProvider } from "@/lib/providers";
import { checkRateLimit } from "@/lib/rate-limit";

const staff2faRoles = new Set(["SUPER_ADMIN", "ADMIN", "OFFICE_MANAGER", "ACCOUNTANT", "SALES", "TECHNICIAN"]);

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: {
    signIn: "/customer-login",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "Security code", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;
        const twoFactorCode = credentials?.twoFactorCode?.trim();
        if (!email || !password) return null;
        const limit = await checkRateLimit(`login:${email}`, 8, 15 * 60 * 1000);
        if (!limit.ok) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash || user.status !== "ACTIVE") return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: { increment: 1 } } });
          await audit("FAILED_LOGIN", "User", { entityId: user.id, metadata: { email } });
          return null;
        }

        if (user.twoFactorEnabled && staff2faRoles.has(user.role)) {
          const hasLiveCode = Boolean(user.twoFactorCodeHash && user.twoFactorExpires && user.twoFactorExpires > new Date());
          const codeIsValid = Boolean(hasLiveCode && twoFactorCode && user.twoFactorCodeHash && await bcrypt.compare(twoFactorCode, user.twoFactorCodeHash));
          if (!codeIsValid) {
            const code = String(randomInt(100000, 999999));
            await prisma.user.update({
              where: { id: user.id },
              data: {
                twoFactorCodeHash: await bcrypt.hash(code, 12),
                twoFactorExpires: new Date(Date.now() + 10 * 60 * 1000),
              },
            });
            await emailProvider.send({
              to: user.email,
              subject: "Your LME security code",
              text: `Your LME security code is ${code}. It expires in 10 minutes.`,
              html: `<p>Your LME security code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
            });
            await audit("TWO_FACTOR_CODE_SENT", "User", { entityId: user.id, metadata: { email } });
            return null;
          }
          await prisma.user.update({ where: { id: user.id }, data: { twoFactorCodeHash: null, twoFactorExpires: null } });
        }

        await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: 0 } });
        await audit("LOGIN", "User", { userId: user.id, entityId: user.id });
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || "";
        session.user.role = String(token.role || "CUSTOMER");
      }
      return session;
    },
  },
};
