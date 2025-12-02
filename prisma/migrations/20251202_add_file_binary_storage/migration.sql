-- AlterTable
ALTER TABLE "Applicant" ADD COLUMN "fileName" TEXT NOT NULL DEFAULT 'document.pdf';
ALTER TABLE "Applicant" ADD COLUMN "fileData" BYTEA NOT NULL DEFAULT E'\\x';
