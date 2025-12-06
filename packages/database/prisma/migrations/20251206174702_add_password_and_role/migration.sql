-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- AlterTable: Add password column with a temporary default for existing rows
ALTER TABLE "users" ADD COLUMN "password" TEXT NOT NULL DEFAULT 'CHANGE_ME',
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- Remove the default from password column (new users must provide a password)
ALTER TABLE "users" ALTER COLUMN "password" DROP DEFAULT;

-- NOTE: Existing users will have 'CHANGE_ME' as password and should be deleted or updated
