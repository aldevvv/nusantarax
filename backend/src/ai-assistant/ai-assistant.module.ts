import { Module } from '@nestjs/common';
import { AiAssistantController } from './ai-assistant.controller';
import { AiAssistantService } from './ai-assistant.service';
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
  controllers: [AiAssistantController],
  providers: [AiAssistantService],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}