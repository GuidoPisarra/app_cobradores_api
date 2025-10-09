/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672'],
      queue: 'users_queue', // 👈 debe coincidir con el gateway
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.listen();
  console.log('✅ Microservicio USERS escuchando en RabbitMQ');
}
bootstrap();