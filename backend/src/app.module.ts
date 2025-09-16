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
import { ThumbnailModule } from './thumbnail/thumbnail.module';
import { CaptionsModule } from './captions/captions.module';
import { OptimizeThumbnailModule } from './optimize-thumbnail/optimize-thumbnail.module';
import { ApiLoggerModule } from './api-logger/api-logger.module';
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
    ThumbnailModule,
    CaptionsModule,
    OptimizeThumbnailModule,
    ApiLoggerModule,
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
