import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LunosService } from './lunos.service';

@Module({
  imports: [ConfigModule],
  providers: [LunosService],
  exports: [LunosService],
})
export class LunosModule {}

