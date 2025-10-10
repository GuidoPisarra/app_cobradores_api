/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from '../services/payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @MessagePattern({ cmd: 'create_payment' })
  async createPayment(@Payload() payload: any) {
    const { user, data } = payload;
    return await this.paymentsService.createPayment(user, data);
  }
}
