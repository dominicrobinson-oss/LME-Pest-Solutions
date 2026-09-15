import { prisma } from "@/lib/db";

export async function checkRateLimit(key: string, limit: number, windowMs: number) {
  const settingKey = `rate-limit:${key}`;
  const now = Date.now();
  const existing = await prisma.businessSetting.findUnique({ where: { key: settingKey } });
  const hits = Array.isArray(existing?.value) ? (existing.value as number[]).filter((time) => now - Number(time) < windowMs) : [];
  if (hits.length >= limit) return { ok: false, remaining: 0, resetAt: new Date(Math.min(...hits) + windowMs) };
  const nextHits = [...hits, now];
  await prisma.businessSetting.upsert({
    where: { key: settingKey },
    update: { value: nextHits },
    create: { key: settingKey, value: nextHits },
  });
  return { ok: true, remaining: limit - nextHits.length, resetAt: new Date(now + windowMs) };
}
