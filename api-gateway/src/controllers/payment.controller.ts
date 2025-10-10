/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';

@Controller('payments')
export class PaymentsController {
  @Client({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672'],
      queue: 'payments_queue',
      queueOptions: { durable: false },
    },
  })
  private paymentsClient!: ClientProxy;

  // ✅ Solo usuarios autenticados pueden acceder
  @UseGuards(AuthGuard('jwt'))
  @Post('crear_pago')
  async createPayment(@Body() body: any, @Request() req: any) {
    const user = req.user;

    // Enviar mensaje al microservicio de pagos con info del usuario
    return this.paymentsClient.send(
      { cmd: 'create_payment' },
      { user, data: body },
    );
  }
}
