import { Module } from '@nestjs/common';
import { ChatBotController } from './chatbot.controller';
import { ChatBotService } from './chatbot.service';
import { GeminiModule } from '../gemini/gemini.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [GeminiModule, EmailModule],
  controllers: [ChatBotController],
  providers: [ChatBotService],
  exports: [ChatBotService],
})
export class ChatBotModule {}