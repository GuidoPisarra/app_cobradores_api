/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from '../services/payments.service';
import { PaymentPayloadDTO } from 'src/dto/PaymentPayloadDTO.dto';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @MessagePattern({ cmd: 'create_payment' })
  async createPayment(@Payload() payload: PaymentPayloadDTO) {
    const { user, data } = payload;
    return await this.paymentsService.createPayment(user, data);
  }
}
