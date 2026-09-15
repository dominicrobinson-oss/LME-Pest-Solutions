import crypto from "node:crypto";

const required = [
  "DATABASE_PROVIDER",
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "PUBLIC_SITE_URL",
  "NEXTAUTH_SECRET",
  "EMAIL_PROVIDER",
  "EMAIL_FROM",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "BANK_ACCOUNT_NAME",
  "BANK_SORT_CODE",
  "BANK_ACCOUNT_NUMBER",
  "STORAGE_PROVIDER",
  "S3_BUCKET",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "BUSINESS_LEGAL_NAME",
  "BUSINESS_REGISTERED_ADDRESS",
];

const placeholders = [
  "example.com",
  "replace",
  "generate-a-long-random-secret",
  "00-00-00",
  "00000000",
  "Add sort code",
  "Add account number",
  "Publish only after verification",
  "USER:PASSWORD@HOST",
  "replace-with-titan-smtp-password",
  "PROJECT_REF",
];

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(`OK   ${message}`);
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

const nodeMajor = Number(process.versions.node.split(".")[0]);
if (nodeMajor === 22) ok(`Node runtime is ${process.version}`);
else fail(`Node runtime must be 22.x for production; current is ${process.version}`);

for (const key of required) {
  const value = process.env[key];
  if (!value) {
    fail(`${key} is missing`);
    continue;
  }
  if (placeholders.some((placeholder) => value.includes(placeholder))) fail(`${key} still contains a placeholder value`);
  else ok(`${key} is set`);
}

for (const key of ["NEXTAUTH_URL", "PUBLIC_SITE_URL"]) {
  if (process.env[key] && !isHttpsUrl(process.env[key])) fail(`${key} must be an HTTPS production URL`);
}

if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
  fail("NEXTAUTH_SECRET must be at least 32 characters");
}

if (process.env.STORAGE_PROVIDER !== "s3") fail("STORAGE_PROVIDER must be s3 for production document/photo storage");
if (process.env.DATABASE_PROVIDER !== "supabase") fail("DATABASE_PROVIDER must be supabase for this launch");
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("supabase")) {
  fail("DATABASE_URL should be a Supabase PostgreSQL connection string for this launch");
}
if (process.env.PAYMENT_PROVIDER && process.env.PAYMENT_PROVIDER !== "bank_transfer") fail("PAYMENT_PROVIDER must remain bank_transfer for this launch");
if (process.env.EMAIL_PROVIDER !== "smtp") fail("EMAIL_PROVIDER must be smtp for Titan/GoDaddy production email");
if (process.env.SMTP_SECURE !== "true") fail("SMTP_SECURE must be true for Titan SMTP over SSL/TLS on port 465");
if (process.env.SMTP_HOST && !["smtp.titan.email", "smtpout.secureserver.net"].includes(process.env.SMTP_HOST)) {
  fail("SMTP_HOST should be smtp.titan.email, or smtpout.secureserver.net if GoDaddy shows that host for this mailbox");
}
if (process.env.S3_ENDPOINT && !process.env.S3_ENDPOINT.includes("supabase.co")) {
  fail("S3_ENDPOINT should use the Supabase Storage S3 endpoint unless a different storage provider has been approved");
}

if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.includes("generate")) {
  console.log(`TIP  Generate a strong secret with: ${crypto.randomBytes(32).toString("hex")}`);
}

if (process.exitCode) {
  console.error("\nProduction environment is not ready. Fix the FAIL lines before go-live.");
  process.exit(process.exitCode);
}

console.log("\nProduction environment checks passed.");
