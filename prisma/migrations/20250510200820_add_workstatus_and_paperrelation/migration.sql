/*
  Warnings:

  - The `status` column on the `Paper` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('draft', 'completed');

-- AlterTable
ALTER TABLE "Paper" DROP COLUMN "status",
ADD COLUMN     "status" "WorkStatus" NOT NULL DEFAULT 'draft';

-- CreateTable
CREATE TABLE "GeneratedWork" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paperId" TEXT,
    "title" TEXT,
    "topic" TEXT,
    "instructions" TEXT NOT NULL,
    "generatedText" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "citationStyle" TEXT NOT NULL,
    "sourceType" TEXT,
    "sourceContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "WorkStatus" NOT NULL DEFAULT 'draft',
    "metadata" JSONB,

    CONSTRAINT "GeneratedWork_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GeneratedWork_userId_idx" ON "GeneratedWork"("userId");

-- CreateIndex
CREATE INDEX "GeneratedWork_createdAt_idx" ON "GeneratedWork"("createdAt");

-- AddForeignKey
ALTER TABLE "GeneratedWork" ADD CONSTRAINT "GeneratedWork_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedWork" ADD CONSTRAINT "GeneratedWork_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE SET NULL ON UPDATE CASCADE;
