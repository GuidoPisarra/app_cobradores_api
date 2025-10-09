/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/users.gateway.ts
import { Controller, Get } from '@nestjs/common';
import { ClientProxy, Client } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';

@Controller('users')
export class UsersGateway {
  @Client({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672'],
      queue: 'users_queue',
      queueOptions: { durable: false },
    },
  })
  private client!: ClientProxy;

  @Get()
  async getUsers() {
    return await this.client.send({ cmd: 'get_users' }, {}).toPromise();
  }
}
