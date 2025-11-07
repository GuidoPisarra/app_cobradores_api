/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from '../services/user.service';
import { UpdateUserDTO } from 'src/dto/updateUser.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @MessagePattern({ cmd: 'auth.validate' })
  async validateUser(data: { email: string; password: string }) {
    const user = await this.usersService.validateUser(data.email, data.password);
    console.log(user);
    if (!user) {
      return { ok: false, error: 'Credenciales inválidas' };
    }
    return { ok: true, user };
  }


  @MessagePattern({ cmd: 'auth.new_user' })
  async createUser(data: { email: string; password: string, name: string }) {
    const user = await this.usersService.createUser(data.email, data.password, data.name);
    if (!user) {
      return { ok: false, error: 'Error al crear usuario' };
    }
    return { ok: true, user };
  }


  @MessagePattern({ cmd: 'auth.delete_user' })
  async deleteUser(data: { id: number }) {
    const user = await this.usersService.deleteUser(data.id);

    return { ok: true, user };
  }

  @MessagePattern({ cmd: 'users.update' })
  async handleUpdateUser(payload: { id: number; dto: UpdateUserDTO }) {
    const { id, dto } = payload;
    const updatedUser = await this.usersService.updateUser(id, dto);
    if (!updatedUser) return { ok: false, error: 'Usuario no encontrado o nada para actualizar' };
    return { ok: true, user: updatedUser };
  }

}