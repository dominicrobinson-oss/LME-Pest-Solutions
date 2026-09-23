import { z } from "zod";

const optionalUrl = z.preprocess((value) => (value === "" ? undefined : value), z.string().url().optional());
const optionalString = z.preprocess((value) => (value === "" ? undefined : value), z.string().optional());
const envBoolean = z.preprocess((value) => {
  if (value === true || value === "true" || value === "1") return true;
  if (value === false || value === "false" || value === "0") return false;
  return value;
}, z.boolean());

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/lme_pest_solutions"),
  DATABASE_PROVIDER: z.enum(["local", "supabase", "postgres"]).default("local"),
  DIRECT_DATABASE_URL: optionalString,
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
  NEXTAUTH_SECRET: z.string().min(12).default("development-secret-change-before-production"),
  PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  WHATSAPP_NUMBER: z.string().default("447301113276"),
  EMAIL_PROVIDER: z.enum(["stub", "smtp"]).default("stub"),
  EMAIL_FROM: optionalString,
  SMTP_HOST: z.string().default("smtp.titan.email"),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_SECURE: envBoolean.default(true),
  SMTP_USER: optionalString,
  SMTP_PASSWORD: optionalString,
  PAYMENT_PROVIDER: z.enum(["bank_transfer", "stub"]).default("bank_transfer"),
  BANK_ACCOUNT_NAME: z.string().default("LME Pest Solutions"),
  BANK_SORT_CODE: z.string().default("Add sort code in production settings"),
  BANK_ACCOUNT_NUMBER: z.string().default("Add account number in production settings"),
  BANK_PAYMENT_NOTES: z.string().default("Use the invoice number as the payment reference."),
  BUSINESS_LEGAL_NAME: optionalString,
  BUSINESS_REGISTERED_ADDRESS: optionalString,
  BUSINESS_COMPANY_NUMBER: optionalString,
  BUSINESS_VAT_NUMBER: optionalString,
  BUSINESS_INSURANCE_SUMMARY: optionalString,
  BUSINESS_ACCREDITATIONS: optionalString,
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  S3_ENDPOINT: optionalUrl,
  S3_REGION: z.string().default("auto"),
  S3_BUCKET: optionalString,
  S3_ACCESS_KEY_ID: optionalString,
  S3_SECRET_ACCESS_KEY: optionalString,
  S3_PUBLIC_BASE_URL: optionalUrl,
  SMS_PROVIDER: z.enum(["stub", "twilio"]).default("stub"),
  MAPS_PROVIDER: z.enum(["stub", "google", "mapbox"]).default("stub"),
});

export const env = envSchema.parse(process.env);
