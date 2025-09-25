import { Module } from '@nestjs/common';
import { BusinessInfoService } from './business-info.service';
import { BusinessInfoController } from './business-info.controller';

@Module({
  controllers: [BusinessInfoController],
  providers: [BusinessInfoService],
  exports: [BusinessInfoService],
})
export class BusinessInfoModule {}