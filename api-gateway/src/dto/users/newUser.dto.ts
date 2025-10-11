import { IsEmail, IsString } from 'class-validator';

export class NewUserDTO {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  name!: string;
}
