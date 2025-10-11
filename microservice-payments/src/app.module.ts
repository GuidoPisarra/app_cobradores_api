/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './services/payments.service';
import { PaymentRepository } from './repositories/payments.repository';
import { MySQLProvider } from './database/database.provider';


@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentRepository, MySQLProvider],
  exports: [MySQLProvider],
})
export class AppModule { }
