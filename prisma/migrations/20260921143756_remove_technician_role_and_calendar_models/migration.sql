-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'OFFICE_MANAGER', 'ACCOUNTANT', 'CUSTOMER', 'SALES', 'SUBCONTRACTOR', 'READ_ONLY');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
COMMIT;

-- DropForeignKey
ALTER TABLE "TechnicianAvailability" DROP CONSTRAINT "TechnicianAvailability_staffId_fkey";

-- DropForeignKey
ALTER TABLE "TimeEntry" DROP CONSTRAINT "TimeEntry_staffId_fkey";

-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "assignedTechnicianId";

-- AlterTable
ALTER TABLE "JobAssignment" ALTER COLUMN "role" SET DEFAULT 'Staff';

-- DropTable
DROP TABLE "TechnicianAvailability";

-- DropTable
DROP TABLE "TimeEntry";

