/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth/auth.module';
import { ProtectedController } from './controllers/protected.controller';
import { PaymentsController } from './controllers/payment.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PAYMENTS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_URL || 'amqp://guest:guest@localhost:5672'],
          queue: 'payments_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'LOGS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'logs_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
    AuthModule,
  ],
  controllers: [ProtectedController, PaymentsController],
})
export class AppModule { }
