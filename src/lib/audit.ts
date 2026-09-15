import { prisma } from "@/lib/db";

export async function audit(action: string, entity: string, input: {
  entityId?: string;
  userId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  metadata?: unknown;
  ipAddress?: string;
} = {}) {
  return prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId: input.entityId,
      userId: input.userId,
      previousValue: input.previousValue === undefined ? undefined : JSON.parse(JSON.stringify(input.previousValue)),
      newValue: input.newValue === undefined ? undefined : JSON.parse(JSON.stringify(input.newValue)),
      metadata: input.metadata === undefined ? undefined : JSON.parse(JSON.stringify(input.metadata)),
      ipAddress: input.ipAddress,
    },
  });
}
