import { Module } from '@nestjs/common';
import { OptimizeThumbnailController } from './optimize-thumbnail.controller';
import { OptimizeThumbnailService } from './optimize-thumbnail.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GeminiModule } from '../gemini/gemini.module';
import { ApiLoggerModule } from '../api-logger/api-logger.module';

@Module({
  imports: [PrismaModule, GeminiModule, ApiLoggerModule],
  controllers: [OptimizeThumbnailController],
  providers: [OptimizeThumbnailService],
  exports: [OptimizeThumbnailService],
})
export class OptimizeThumbnailModule {}