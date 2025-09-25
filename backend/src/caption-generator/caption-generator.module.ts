import { Module } from '@nestjs/common';
import { CaptionGeneratorController } from './caption-generator.controller';
import { CaptionGeneratorService } from './caption-generator.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GeminiModule } from '../gemini/gemini.module';
import { ApiLoggerModule } from '../api-logger/api-logger.module';
import { BusinessInfoModule } from '../business-info/business-info.module';

@Module({
  imports: [
    PrismaModule,
    GeminiModule,
    ApiLoggerModule,
    BusinessInfoModule,
  ],
  controllers: [CaptionGeneratorController],
  providers: [CaptionGeneratorService],
  exports: [CaptionGeneratorService],
})
export class CaptionGeneratorModule {}