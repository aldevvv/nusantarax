import { Module } from '@nestjs/common';
import { TopupController } from './topup.controller';
import { TopupService } from './topup.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MidtransModule } from '../midtrans/midtrans.module';
import { PromoModule } from '../promo/promo.module';

@Module({
  imports: [PrismaModule, MidtransModule, PromoModule],
  controllers: [TopupController],
  providers: [TopupService],
  exports: [TopupService],
})
export class TopupModule {}