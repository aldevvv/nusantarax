import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { GeminiModule } from './gemini/gemini.module';
import { ApiLoggerModule } from './api-logger/api-logger.module';
import { WalletModule } from './wallet/wallet.module';
import { BillingModule } from './billing/billing.module';
import { TrialModule } from './trial/trial.module';
import { TopupModule } from './topup/topup.module';
import { MidtransModule } from './midtrans/midtrans.module';
import { PromoModule } from './promo/promo.module';
import { BusinessInfoModule } from './business-info/business-info.module';
import { ImageGeneratorModule } from './image-generator/image-generator.module';
import { CaptionGeneratorModule } from './caption-generator/caption-generator.module';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';
import { ChatBotModule } from './chatbot/chatbot.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),
    
    // Database
    PrismaModule,
    
    // Features
    AuthModule,
    UsersModule,
    EmailModule,
    GeminiModule,
    ApiLoggerModule,
    WalletModule,
    BillingModule,
    TrialModule,
    TopupModule,
    MidtransModule,
    PromoModule,
    BusinessInfoModule,
    ImageGeneratorModule,
    CaptionGeneratorModule,
    AiAssistantModule,
    ChatBotModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global authentication guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
