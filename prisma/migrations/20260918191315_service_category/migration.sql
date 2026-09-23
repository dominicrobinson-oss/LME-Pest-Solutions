-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('PEST_CONTROL', 'HOME_MAINTENANCE');

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "category" "ServiceCategory" NOT NULL DEFAULT 'PEST_CONTROL';
