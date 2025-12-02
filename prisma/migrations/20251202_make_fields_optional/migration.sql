-- AlterTable
ALTER TABLE "Applicant" ALTER COLUMN "fileName" DROP NOT NULL;
ALTER TABLE "Applicant" ALTER COLUMN "fileData" DROP NOT NULL;
ALTER TABLE "Applicant" ADD COLUMN "fileUrl" TEXT;
