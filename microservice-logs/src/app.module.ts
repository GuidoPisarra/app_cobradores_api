/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsModule } from './logs/logs.module';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_URI ??
      (() => {
        throw new Error('MONGO_URI is not defined');
      })(),
    ),
    LogsModule,
    ClientsModule.register([
      {
        name: 'LOGS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: process.env.RABBITMQ_URL ? [process.env.RABBITMQ_URL] : [],
          queue: 'logs_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  providers: [JwtService],
})
export class AppModule { }
