import { IsNumber, IsString } from 'class-validator';

export class CratePaymentDTO {
  @IsNumber()
  amount!: number;

  @IsString()
  concept!: string;
}
