import { IsNumber, IsString, IsObject } from 'class-validator';

export class UserDTO {
  @IsString()
  id!: string;

  @IsString()
  email!: string;
}

export class DataDTO {
  @IsNumber()
  amount!: number;

  @IsString()
  concept!: string;
}

export class PaymentPayloadDTO {
  @IsObject()
  user!: UserDTO;

  @IsObject()
  data!: DataDTO;
}
