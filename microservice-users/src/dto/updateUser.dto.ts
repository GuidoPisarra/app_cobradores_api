import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDTO {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
