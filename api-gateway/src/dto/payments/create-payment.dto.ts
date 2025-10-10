import { IsNumber, IsString } from 'class-validator';

export class CratePaymentDTO {
  @IsNumber()
  amount!: string;

  @IsString()
  concept!: string;
}
