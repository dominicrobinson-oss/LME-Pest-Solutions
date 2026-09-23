import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import type { UserRole } from "@/generated/prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const adminRoles: UserRole[] = ["SUPER_ADMIN", "ADMIN", "OFFICE_MANAGER", "ACCOUNTANT", "SALES"];

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/customer-login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.status !== "ACTIVE") redirect("/customer-login");
  return user;
}

export async function requireRole(role: UserRole) {
  const user = await requireUser();
  if (user.role !== role && user.role !== "SUPER_ADMIN") notFound();
  return user;
}

export async function requireAnyRole(roles: UserRole[]) {
  const user = await requireUser();
  if (user.role !== "SUPER_ADMIN" && !roles.includes(user.role)) notFound();
  return user;
}

export async function requireCustomerOwnership(customerId: string) {
  const user = await requireUser();
  if (user.role === "SUPER_ADMIN" || adminRoles.includes(user.role)) return user;
  const customer = await prisma.customer.findFirst({ where: { id: customerId, userId: user.id }, select: { id: true } });
  if (!customer) notFound();
  return user;
}

export async function requireTechnicianAssignment(jobId: string) {
  const user = await requireUser();
  if (user.role === "SUPER_ADMIN" || adminRoles.includes(user.role)) return user;
  if (user.role !== "TECHNICIAN") notFound();
  const assignment = await prisma.jobAssignment.findFirst({ where: { jobId, userId: user.id }, select: { id: true } });
  if (!assignment) notFound();
  return user;
}
