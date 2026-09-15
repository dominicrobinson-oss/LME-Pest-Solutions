import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function productionEnv(overrides: Partial<NodeJS.ProcessEnv> = {}): NodeJS.ProcessEnv {
  return {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || "test",
    DATABASE_PROVIDER: "supabase",
    DATABASE_URL: "postgresql://postgres.project:secret@aws-0-eu-west-2.pooler.supabase.com:6543/postgres",
    NEXTAUTH_URL: "https://lme.example.co.uk",
    PUBLIC_SITE_URL: "https://lme.example.co.uk",
    NEXTAUTH_SECRET: "1234567890abcdef1234567890abcdef",
    EMAIL_PROVIDER: "smtp",
    EMAIL_FROM: "LME Pest Solutions <info@lme.example.co.uk>",
    SMTP_HOST: "smtp.titan.email",
    SMTP_PORT: "465",
    SMTP_SECURE: "true",
    SMTP_USER: "info@lme.example.co.uk",
    SMTP_PASSWORD: "real-titan-password",
    PAYMENT_PROVIDER: "bank_transfer",
    BANK_ACCOUNT_NAME: "LME Pest Solutions",
    BANK_SORT_CODE: "12-34-56",
    BANK_ACCOUNT_NUMBER: "12345678",
    STORAGE_PROVIDER: "s3",
    S3_ENDPOINT: "https://project.supabase.co/storage/v1/s3",
    S3_BUCKET: "lme-documents",
    S3_ACCESS_KEY_ID: "supabase-access-key",
    S3_SECRET_ACCESS_KEY: "supabase-secret-key",
    BUSINESS_LEGAL_NAME: "LME Pest Solutions",
    BUSINESS_REGISTERED_ADDRESS: "Manchester",
    ...overrides,
  };
}

describe("production env verifier", () => {
  it("requires Titan SMTP password for production launch", () => {
    const env = productionEnv({ SMTP_PASSWORD: "" });
    const result = spawnSync(process.execPath, ["scripts/verify-production-env.mjs"], {
      cwd: process.cwd(),
      env,
      encoding: "utf8",
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("SMTP_PASSWORD is missing");
    expect(result.stderr).not.toContain("RESEND_API_KEY");
  });

  it("requires Supabase as the production database provider", () => {
    const result = spawnSync(process.execPath, ["scripts/verify-production-env.mjs"], {
      cwd: process.cwd(),
      env: productionEnv({ DATABASE_PROVIDER: "postgres", DATABASE_URL: "postgresql://user:pass@db.example.co.uk:5432/lme" }),
      encoding: "utf8",
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("DATABASE_PROVIDER must be supabase");
    expect(result.stderr).toContain("DATABASE_URL should be a Supabase PostgreSQL connection string");
  });
});
