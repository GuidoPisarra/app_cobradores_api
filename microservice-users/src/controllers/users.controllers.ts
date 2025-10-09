/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from '../services/user.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @MessagePattern({ cmd: 'auth.validate' })
  async validateUser(data: { email: string; password: string }) {
    const user = await this.usersService.validateUser(data.email, data.password);
    if (!user) {
      return { ok: false, error: 'Credenciales inválidas' };
    }
    return { ok: true, user };
  }
}