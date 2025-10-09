/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth/auth.module';
import { ProtectedController } from './controllers/protected.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_URL || 'amqp://guest:guest@localhost:5672'],
          queue: 'users_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
    AuthModule,
  ],
  controllers: [ProtectedController],
})
export class AppModule { }
