/*
  Warnings:

  - You are about to drop the `gemini_api_keys` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ApiCallStatus" AS ENUM ('SUCCESS', 'FAILED', 'TIMEOUT', 'RATE_LIMITED');

-- AlterTable
ALTER TABLE "public"."thumbnail_requests" ADD COLUMN     "brief" JSONB,
ADD COLUMN     "finalPrompt" TEXT,
ALTER COLUMN "originalFileName" DROP NOT NULL,
ALTER COLUMN "originalFileSize" DROP NOT NULL,
ALTER COLUMN "originalMimeType" DROP NOT NULL,
ALTER COLUMN "imageData" DROP NOT NULL,
ALTER COLUMN "modelUsed" SET DEFAULT 'google-imagen-4.0';

-- AlterTable
ALTER TABLE "public"."thumbnail_results" ADD COLUMN     "imageUrl" TEXT;

-- DropTable
DROP TABLE "public"."gemini_api_keys";

-- CreateTable
CREATE TABLE "public"."api_call_logs" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "modelUsed" TEXT,
    "status" "public"."ApiCallStatus" NOT NULL DEFAULT 'SUCCESS',
    "responseTime" INTEGER,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "totalTokens" INTEGER,
    "errorMessage" TEXT,
    "errorCode" TEXT,
    "userId" TEXT,
    "requestSize" INTEGER,
    "responseSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_call_logs_pkey" PRIMARY KEY ("id")
);
