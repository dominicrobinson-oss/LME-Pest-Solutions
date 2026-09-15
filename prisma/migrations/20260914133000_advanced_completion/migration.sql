ALTER TABLE "User"
  ADD COLUMN "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "twoFactorCodeHash" TEXT,
  ADD COLUMN "twoFactorExpires" TIMESTAMP(3);
