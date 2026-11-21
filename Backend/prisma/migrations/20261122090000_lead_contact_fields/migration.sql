-- Contact form messages and the details of quote requests.
ALTER TYPE "LeadSource" ADD VALUE 'contact';

ALTER TABLE "leads"
  ADD COLUMN "name" TEXT,
  ADD COLUMN "company" TEXT,
  ADD COLUMN "projectType" TEXT,
  ADD COLUMN "message" TEXT;
