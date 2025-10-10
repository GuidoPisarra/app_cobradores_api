/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from '@nestjs/common';
import { ClientProxy, Client } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { LoginDto } from '../dto/users/login.dto';
import { AppService } from '../app.service';

@Controller()
export class AppController {
  @Client({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672'],
      queue: 'users_queue',
      queueOptions: { durable: true },
    },
  })
  private usersClient!: ClientProxy;

  constructor(private readonly appService: AppService) { }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.usersClient.send({ cmd: 'login' }, loginDto).toPromise();
  }
}
