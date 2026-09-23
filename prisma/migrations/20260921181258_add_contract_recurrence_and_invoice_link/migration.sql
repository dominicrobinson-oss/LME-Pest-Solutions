-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'OFFICE_MANAGER', 'ACCOUNTANT', 'CUSTOMER', 'SALES');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
COMMIT;

-- AlterTable
ALTER TABLE "CommercialContract" ADD COLUMN     "invoiceIntervalMonths" INTEGER,
ADD COLUMN     "visitDurationMinutes" INTEGER,
ADD COLUMN     "visitIntervalWeeks" INTEGER;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "contractId" TEXT;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "CommercialContract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
