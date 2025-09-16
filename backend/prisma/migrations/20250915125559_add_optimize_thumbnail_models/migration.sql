-- CreateTable
CREATE TABLE "public"."optimize_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "originalFileSize" INTEGER NOT NULL,
    "originalMimeType" TEXT NOT NULL,
    "imageData" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "optimizations" JSONB NOT NULL,
    "exportFormats" TEXT[],
    "modelUsed" TEXT NOT NULL DEFAULT 'gemini-2.5-flash-image-preview',
    "finalPrompt" TEXT,
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'PROCESSING',
    "processingTime" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "optimize_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."optimize_results" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "templateUsed" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "dimensions" JSONB NOT NULL,
    "optimizationsApplied" JSONB NOT NULL,
    "qualityScore" INTEGER,
    "improvementNotes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "optimize_results_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."optimize_requests" ADD CONSTRAINT "optimize_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."optimize_results" ADD CONSTRAINT "optimize_results_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."optimize_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
