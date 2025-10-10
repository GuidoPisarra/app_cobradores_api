/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Controller('payments')
export class PaymentsController {
  @Client({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672'],
      queue: 'payments_queue',
      queueOptions: { durable: true },
    },
  })
  private paymentsClient!: ClientProxy;

  @UseGuards(AuthGuard('jwt'))
  @Post('crear_pago')
  async createPayment(@Body() body: any, @Request() req: any) {
    const user = req.user;

    const observable = this.paymentsClient.send(
      { cmd: 'create_payment' },
      { user, data: body },
    );
    const result = await lastValueFrom(observable);
    return result;
  }
}
