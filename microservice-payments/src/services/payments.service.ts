/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  async createPayment(user: any, data: any) {
    console.log('💳 Usuario autenticado:', user);
    console.log('📦 Datos del pago:', data);

    // Simular lógica de pago
    return {
      ok: true,
      message: `Pago procesado correctamente para ${user.email}`,
      monto: data.amount,
      referencia: `PAY-${Date.now()}`,
    };
  }
}
