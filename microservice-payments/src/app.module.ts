/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './services/payments.service';
import { PaymentRepository } from './repositories/payments.repository';


@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentRepository],
})
export class AppModule { }
