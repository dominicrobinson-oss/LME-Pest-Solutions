export function matchesEnum<T extends string>(value: string | undefined, enumObject: Record<string, T>): T | undefined {
  return value && (Object.values(enumObject) as string[]).includes(value) ? (value as T) : undefined;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function businessPhoneHref(phone = "07301 113 276") {
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function whatsappHref(message = "Hi LME Pest Solutions, I would like a pest control quote.") {
  const number = process.env.WHATSAPP_NUMBER || "447301113276";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
