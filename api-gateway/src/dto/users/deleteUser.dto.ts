import { IsNumber } from 'class-validator';

export class DeleteUserDTO {
  @IsNumber()
  id!: string;
}
