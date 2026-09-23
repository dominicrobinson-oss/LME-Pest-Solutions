import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import type { UserRole } from "@/generated/prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const adminRoles: UserRole[] = ["SUPER_ADMIN", "ADMIN", "OFFICE_MANAGER", "ACCOUNTANT", "SALES"];

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.status !== "ACTIVE") return null;
  return user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/admin");
  return user;
}

export async function requireAnyRole(roles: UserRole[]) {
  const user = await requireUser();
  if (user.role !== "SUPER_ADMIN" && !roles.includes(user.role)) notFound();
  return user;
}
