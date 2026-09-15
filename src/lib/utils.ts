import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function currency(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

export function businessPhoneHref(phone = "07301 113 276") {
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function whatsappHref(message = "Hi LME Pest Solutions, I would like a pest control quote.") {
  const number = process.env.WHATSAPP_NUMBER || "447301113276";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
