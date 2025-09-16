-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "public"."thumbnail_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "originalFileSize" INTEGER NOT NULL,
    "originalMimeType" TEXT NOT NULL,
    "imageData" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL DEFAULT 'gemini-2.5-flash-image-preview',
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'PROCESSING',
    "processingTime" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thumbnail_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."thumbnail_results" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "promptVariation" TEXT NOT NULL,
    "resultText" TEXT NOT NULL,
    "resultOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thumbnail_results_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."thumbnail_requests" ADD CONSTRAINT "thumbnail_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."thumbnail_results" ADD CONSTRAINT "thumbnail_results_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."thumbnail_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
