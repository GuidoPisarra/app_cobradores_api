/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { UpdateUserDTO } from 'src/dto/updateUser.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) { }

  // Valida usuario para login
  async validateUser(email: string, passwordUsuario: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(passwordUsuario, user.password);
    if (!isValid) return null;

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async createUser(email: string, password: string, name: string) {
    try {
      const user = await this.usersRepository.createUser(email, name, password);
      return user;
    } catch (err: any) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Email ya registrado');
      }
      throw new InternalServerErrorException('Error creando usuario');
    }
  }

  async deleteUser(id: number) {
    const user = await this.usersRepository.deleteUser(id);
    return user;
  }

  async updateUser(id: number, dto: UpdateUserDTO) {
    try {
      const updatedUser = await this.usersRepository.updateUser(id, dto);
      if (!updatedUser) {
        throw new NotFoundException('Usuario no encontrado o nada para actualizar');
      }
      return updatedUser;
    } catch (err) {
      console.error('Error en UsersService.updateUser:', err);
      throw err;
    }
  }
}
