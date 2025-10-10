/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Controller, Post, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CratePaymentDTO } from '../dto/payments/create-payment.dto';

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
  async createPayment(@Body() body: CratePaymentDTO, @Request() req: any) {
    const user = req.user;
    try {
      const observable = this.paymentsClient.send(
        { cmd: 'create_payment' },
        { user, data: body },
      );
      const result = await lastValueFrom(observable);
      if (!result || result.ok === false) {
        throw new HttpException(result?.error || 'Creacion de pago fallida.', HttpStatus.UNAUTHORIZED);
      }

      return result;
    } catch (err: any) {
      const message = err?.message || 'Error al crear el pago';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
