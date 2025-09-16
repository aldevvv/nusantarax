-- CreateEnum
CREATE TYPE "public"."Platform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'TIKTOK');

-- CreateEnum
CREATE TYPE "public"."CaptionFormat" AS ENUM ('SHORT', 'MEDIUM', 'LONG', 'SHORT_NO_HASHTAGS', 'MEDIUM_NO_HASHTAGS', 'LONG_NO_HASHTAGS');

-- CreateTable
CREATE TABLE "public"."caption_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "originalFileSize" INTEGER NOT NULL,
    "originalMimeType" TEXT NOT NULL,
    "imageData" TEXT NOT NULL,
    "productAnalysis" JSONB NOT NULL,
    "targetAudience" TEXT,
    "brandTone" TEXT,
    "productCategory" TEXT,
    "keyFeatures" TEXT[],
    "platforms" "public"."Platform"[],
    "formats" "public"."CaptionFormat"[],
    "modelUsed" TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'PROCESSING',
    "processingTime" INTEGER,
    "errorMessage" TEXT,
    "totalVariations" INTEGER NOT NULL DEFAULT 0,
    "bestPerformer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caption_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."caption_results" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "platform" "public"."Platform" NOT NULL,
    "format" "public"."CaptionFormat" NOT NULL,
    "version" INTEGER NOT NULL,
    "caption" TEXT NOT NULL,
    "hashtags" TEXT[],
    "callToAction" TEXT,
    "characterCount" INTEGER NOT NULL,
    "engagementScore" INTEGER NOT NULL DEFAULT 0,
    "viralPotential" INTEGER NOT NULL DEFAULT 0,
    "conversionScore" INTEGER NOT NULL DEFAULT 0,
    "audienceMatch" INTEGER NOT NULL DEFAULT 0,
    "overallScore" INTEGER NOT NULL DEFAULT 0,
    "actualViews" INTEGER DEFAULT 0,
    "actualEngagement" INTEGER DEFAULT 0,
    "actualConversions" INTEGER DEFAULT 0,
    "actualROI" DOUBLE PRECISION,
    "strengths" TEXT[],
    "improvements" TEXT[],
    "riskFactors" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "caption_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."caption_analytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "public"."Platform" NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "totalCaptions" INTEGER NOT NULL DEFAULT 0,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "totalEngagement" INTEGER NOT NULL DEFAULT 0,
    "totalConversions" INTEGER NOT NULL DEFAULT 0,
    "averageROI" DOUBLE PRECISION,
    "bestPerformingTone" TEXT,
    "optimalLength" INTEGER,
    "topHashtags" TEXT[],
    "trendingTopics" TEXT[],
    "audienceInsights" JSONB,
    "competitorData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caption_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "caption_analytics_userId_platform_period_key" ON "public"."caption_analytics"("userId", "platform", "period");

-- AddForeignKey
ALTER TABLE "public"."caption_requests" ADD CONSTRAINT "caption_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."caption_results" ADD CONSTRAINT "caption_results_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."caption_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."caption_analytics" ADD CONSTRAINT "caption_analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
