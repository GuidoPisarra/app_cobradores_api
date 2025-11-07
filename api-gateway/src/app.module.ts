/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ClientsModule, Transport, ClientProxyFactory } from '@nestjs/microservices';
import { AuthModule } from './auth/auth.module';
import { ProtectedController } from './controllers/protected.controller';
import { PaymentsController } from './controllers/payment.controller';
import { VehicleInspectionController } from './controllers/vehicle-inspection.controller';

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
  controllers: [ProtectedController, PaymentsController, VehicleInspectionController],
  providers: [
    {
      provide: 'VEHICLE_INSPECTION_SERVICE',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: ['amqp://guest:guest@localhost:5672'],
            queue: 'vehicle_inspection_rpc',
            queueOptions: { durable: true },
          },
        }),
    },
  ],
  exports: ['VEHICLE_INSPECTION_SERVICE'], // <--- importante si se usa en otros módulos
})
export class AppModule { }
