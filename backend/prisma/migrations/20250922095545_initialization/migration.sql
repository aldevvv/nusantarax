-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."Provider" AS ENUM ('LOCAL', 'GITHUB', 'GOOGLE');

-- CreateEnum
CREATE TYPE "public"."PeriodType" AS ENUM ('DAILY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "public"."BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('SUBSCRIPTION', 'WALLET_TOPUP', 'REFUND', 'DEDUCTION');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."TrialStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CONVERTED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."ApiCallStatus" AS ENUM ('SUCCESS', 'FAILED', 'TIMEOUT', 'RATE_LIMITED');

-- CreateEnum
CREATE TYPE "public"."TopupRequestStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "public"."PromoApplicableFor" AS ENUM ('TOPUP', 'PLAN', 'BOTH');

-- CreateEnum
CREATE TYPE "public"."ImageRequestType" AS ENUM ('TEMPLATE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."ImageRequestStatus" AS ENUM ('PROCESSING', 'ANALYZING', 'GENERATING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."BusinessSize" AS ENUM ('MICRO', 'SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "public"."CaptionPlatform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'TIKTOK');

-- CreateEnum
CREATE TYPE "public"."CaptionTone" AS ENUM ('PROFESSIONAL', 'CASUAL', 'FUNNY', 'INSPIRING', 'SALES', 'EDUCATIONAL', 'STORYTELLING');

-- CreateEnum
CREATE TYPE "public"."CaptionLength" AS ENUM ('SHORT', 'MEDIUM', 'LONG');

-- CreateEnum
CREATE TYPE "public"."CaptionLanguage" AS ENUM ('EN', 'ID');

-- CreateEnum
CREATE TYPE "public"."CaptionRequestStatus" AS ENUM ('PROCESSING', 'ANALYZING_IMAGE', 'GENERATING_CAPTIONS', 'ANALYZING_CAPTIONS', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "fullName" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_providers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "public"."Provider" NOT NULL DEFAULT 'LOCAL',
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_api_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "periodType" "public"."PeriodType" NOT NULL DEFAULT 'DAILY',
    "totalRequests" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "geminiGenerate" INTEGER NOT NULL DEFAULT 0,
    "geminiAnalyze" INTEGER NOT NULL DEFAULT 0,
    "geminiChat" INTEGER NOT NULL DEFAULT 0,
    "geminiPro" INTEGER NOT NULL DEFAULT 0,
    "geminiFlash" INTEGER NOT NULL DEFAULT 0,
    "geminiVision" INTEGER NOT NULL DEFAULT 0,
    "subscriptionPlanId" TEXT,
    "requestsLimit" INTEGER,
    "limitExceeded" BOOLEAN NOT NULL DEFAULT false,
    "blockedRequests" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_api_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "monthlyRequests" INTEGER NOT NULL,
    "monthlyPrice" INTEGER NOT NULL DEFAULT 0,
    "yearlyPrice" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "billingCycle" "public"."BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "requestsUsed" INTEGER NOT NULL DEFAULT 0,
    "requestsLimit" INTEGER NOT NULL,
    "isTrialActive" BOOLEAN NOT NULL DEFAULT false,
    "trialStartDate" TIMESTAMP(3),
    "trialEndDate" TIMESTAMP(3),
    "hasUsedTrial" BOOLEAN NOT NULL DEFAULT false,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "totalDeposited" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."PaymentType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "planId" TEXT,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "externalId" TEXT,
    "processedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."topup_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "proofImageUrl" TEXT,
    "status" "public"."TopupRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "paymentHistoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topup_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."promo_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "public"."DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "discountValue" INTEGER NOT NULL,
    "maxUsage" INTEGER NOT NULL DEFAULT -1,
    "currentUsage" INTEGER NOT NULL DEFAULT 0,
    "maxUsagePerUser" INTEGER NOT NULL DEFAULT 1,
    "maxTotalUsers" INTEGER NOT NULL DEFAULT -1,
    "currentUsers" INTEGER NOT NULL DEFAULT 0,
    "applicableFor" "public"."PromoApplicableFor" NOT NULL DEFAULT 'TOPUP',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "minAmount" INTEGER NOT NULL DEFAULT 0,
    "maxDiscount" INTEGER,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."topup_promo_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "paymentHistoryId" TEXT NOT NULL,
    "discountAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topup_promo_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trial_configurations" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "trialDays" INTEGER NOT NULL DEFAULT 7,
    "maxTrialUsers" INTEGER NOT NULL DEFAULT 100,
    "currentTrialUsers" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trial_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trial_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "trialConfigId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "public"."TrialStatus" NOT NULL DEFAULT 'ACTIVE',
    "convertedToPaid" BOOLEAN NOT NULL DEFAULT false,
    "conversionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trial_history_pkey" PRIMARY KEY ("id")
);

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
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "requestsRemaining" INTEGER,
    "requestSize" INTEGER,
    "responseSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."business_info" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "brandColors" JSONB NOT NULL,
    "logoUrl" TEXT,
    "industry" TEXT,
    "businessModel" TEXT,
    "targetAudience" TEXT,
    "businessSize" "public"."BusinessSize" NOT NULL DEFAULT 'MICRO',
    "establishedYear" INTEGER,
    "mainProducts" JSONB,
    "keyServices" JSONB,
    "brandVoice" TEXT,
    "brandPersonality" JSONB,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "postalCode" TEXT,
    "website" TEXT,
    "phoneNumber" TEXT,
    "socialMedia" JSONB,
    "businessGoals" JSONB,
    "marketingFocus" JSONB,
    "contentTone" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'id',
    "completedAt" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."image_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "subCategory" TEXT NOT NULL,
    "promptTemplate" TEXT NOT NULL,
    "requiredFields" JSONB NOT NULL,
    "exampleImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."image_generation_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "type" "public"."ImageRequestType" NOT NULL DEFAULT 'CUSTOM',
    "templateId" TEXT,
    "originalPrompt" TEXT NOT NULL,
    "enhancedPrompt" TEXT NOT NULL,
    "inputFields" JSONB,
    "includeBusinessInfo" BOOLEAN NOT NULL DEFAULT false,
    "businessContext" TEXT,
    "style" TEXT,
    "backgroundPreference" TEXT,
    "analysisModel" TEXT,
    "generationModel" TEXT,
    "analysisInputTokens" INTEGER,
    "analysisOutputTokens" INTEGER,
    "analysisTokens" INTEGER,
    "generationTokens" INTEGER,
    "totalTokens" INTEGER,
    "status" "public"."ImageRequestStatus" NOT NULL DEFAULT 'PROCESSING',
    "errorMessage" TEXT,
    "totalImages" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "image_generation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."image_generation_results" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageSize" TEXT,
    "fileSize" INTEGER,
    "fileName" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "seed" TEXT,
    "generationTime" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 1,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_generation_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."caption_generation_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageFileName" TEXT NOT NULL,
    "captionIdea" TEXT,
    "platform" "public"."CaptionPlatform" NOT NULL,
    "targetAudience" TEXT,
    "tone" "public"."CaptionTone" NOT NULL,
    "captionLength" "public"."CaptionLength" NOT NULL,
    "language" "public"."CaptionLanguage" NOT NULL DEFAULT 'EN',
    "useEmojis" BOOLEAN NOT NULL DEFAULT true,
    "useHashtags" BOOLEAN NOT NULL DEFAULT true,
    "includeBusinessInfo" BOOLEAN NOT NULL DEFAULT false,
    "businessContext" TEXT,
    "imageAnalysisPrompt" TEXT,
    "captionAnalysisPrompt" TEXT,
    "analysisModel" TEXT,
    "imageAnalysisInputTokens" INTEGER,
    "imageAnalysisOutputTokens" INTEGER,
    "captionAnalysisInputTokens" INTEGER,
    "captionAnalysisOutputTokens" INTEGER,
    "totalTokens" INTEGER,
    "status" "public"."CaptionRequestStatus" NOT NULL DEFAULT 'PROCESSING',
    "errorMessage" TEXT,
    "totalCaptions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "caption_generation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."caption_generation_results" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "captionText" TEXT NOT NULL,
    "hashtags" TEXT,
    "platform" "public"."CaptionPlatform" NOT NULL,
    "characterCount" INTEGER NOT NULL,
    "hashtagCount" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 1,
    "engagementScore" INTEGER,
    "readabilityScore" INTEGER,
    "ctaStrength" INTEGER,
    "brandVoiceScore" INTEGER,
    "trendingPotential" INTEGER,
    "emotionalImpact" INTEGER,
    "hookEffectiveness" INTEGER,
    "platformOptimization" INTEGER,
    "keywordRelevance" INTEGER,
    "viralityPotential" TEXT,
    "analysisDetails" JSONB,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "caption_generation_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_emailVerificationToken_key" ON "public"."users"("emailVerificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_passwordResetToken_key" ON "public"."users"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "user_providers_userId_provider_key" ON "public"."user_providers"("userId", "provider");

-- CreateIndex
CREATE INDEX "user_api_usage_subscriptionPlanId_idx" ON "public"."user_api_usage"("subscriptionPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "user_api_usage_userId_period_periodType_key" ON "public"."user_api_usage"("userId", "period", "periodType");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "public"."subscription_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_userId_key" ON "public"."user_subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_wallets_userId_key" ON "public"."user_wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "topup_requests_paymentHistoryId_key" ON "public"."topup_requests"("paymentHistoryId");

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "public"."promo_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "topup_promo_usage_userId_promoCodeId_paymentHistoryId_key" ON "public"."topup_promo_usage"("userId", "promoCodeId", "paymentHistoryId");

-- CreateIndex
CREATE INDEX "api_call_logs_userId_createdAt_idx" ON "public"."api_call_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "api_call_logs_subscriptionId_idx" ON "public"."api_call_logs"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "business_info_userId_key" ON "public"."business_info"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "image_generation_requests_requestId_key" ON "public"."image_generation_requests"("requestId");

-- CreateIndex
CREATE INDEX "image_generation_requests_userId_createdAt_idx" ON "public"."image_generation_requests"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "image_generation_requests_requestId_idx" ON "public"."image_generation_requests"("requestId");

-- CreateIndex
CREATE INDEX "image_generation_requests_status_idx" ON "public"."image_generation_requests"("status");

-- CreateIndex
CREATE INDEX "image_generation_results_requestId_order_idx" ON "public"."image_generation_results"("requestId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "caption_generation_requests_requestId_key" ON "public"."caption_generation_requests"("requestId");

-- CreateIndex
CREATE INDEX "caption_generation_requests_userId_createdAt_idx" ON "public"."caption_generation_requests"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "caption_generation_requests_requestId_idx" ON "public"."caption_generation_requests"("requestId");

-- CreateIndex
CREATE INDEX "caption_generation_requests_status_idx" ON "public"."caption_generation_requests"("status");

-- CreateIndex
CREATE INDEX "caption_generation_results_requestId_order_idx" ON "public"."caption_generation_results"("requestId", "order");

-- AddForeignKey
ALTER TABLE "public"."user_providers" ADD CONSTRAINT "user_providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_api_usage" ADD CONSTRAINT "user_api_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_api_usage" ADD CONSTRAINT "user_api_usage_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "public"."subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_subscriptions" ADD CONSTRAINT "user_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_wallets" ADD CONSTRAINT "user_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_history" ADD CONSTRAINT "payment_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_history" ADD CONSTRAINT "payment_history_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."topup_requests" ADD CONSTRAINT "topup_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."topup_requests" ADD CONSTRAINT "topup_requests_paymentHistoryId_fkey" FOREIGN KEY ("paymentHistoryId") REFERENCES "public"."payment_history"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."topup_promo_usage" ADD CONSTRAINT "topup_promo_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."topup_promo_usage" ADD CONSTRAINT "topup_promo_usage_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "public"."promo_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."topup_promo_usage" ADD CONSTRAINT "topup_promo_usage_paymentHistoryId_fkey" FOREIGN KEY ("paymentHistoryId") REFERENCES "public"."payment_history"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trial_configurations" ADD CONSTRAINT "trial_configurations_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trial_history" ADD CONSTRAINT "trial_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trial_history" ADD CONSTRAINT "trial_history_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trial_history" ADD CONSTRAINT "trial_history_trialConfigId_fkey" FOREIGN KEY ("trialConfigId") REFERENCES "public"."trial_configurations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."api_call_logs" ADD CONSTRAINT "api_call_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."business_info" ADD CONSTRAINT "business_info_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."image_generation_requests" ADD CONSTRAINT "image_generation_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."image_generation_requests" ADD CONSTRAINT "image_generation_requests_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."image_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."image_generation_results" ADD CONSTRAINT "image_generation_results_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."image_generation_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."caption_generation_requests" ADD CONSTRAINT "caption_generation_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."caption_generation_results" ADD CONSTRAINT "caption_generation_results_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."caption_generation_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
