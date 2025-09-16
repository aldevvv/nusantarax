import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { GeminiModule } from '../gemini/gemini.module';
import { LunosModule } from '../lunos/lunos.module';
import { ThumbnailController } from './thumbnail.controller';
import { ThumbnailService } from './thumbnail.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    GeminiModule,
    LunosModule,
  ],
  controllers: [ThumbnailController],
  providers: [ThumbnailService],
  exports: [ThumbnailService],
})
export class ThumbnailModule {}
