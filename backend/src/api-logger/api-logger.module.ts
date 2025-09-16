import { Module } from '@nestjs/common';
import { ApiLoggerService } from './api-logger.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ApiLoggerService],
  exports: [ApiLoggerService],
})
export class ApiLoggerModule {}