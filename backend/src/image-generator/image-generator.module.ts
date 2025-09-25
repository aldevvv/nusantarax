import { Module } from '@nestjs/common';
import { ImageGeneratorController } from './image-generator.controller';
import { ImageGeneratorService } from './image-generator.service';
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
  controllers: [ImageGeneratorController],
  providers: [ImageGeneratorService],
  exports: [ImageGeneratorService],
})
export class ImageGeneratorModule {}