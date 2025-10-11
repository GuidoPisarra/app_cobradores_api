/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from '../repositories/user.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) { }

  // Valida usuario para login
  async validateUser(email: string, passwordUsuario: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) return null;

    // comparar la contraseña plana con el hash guardado
    const isValid = await bcrypt.compare(passwordUsuario, user.password);
    if (!isValid) return null;

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async createUser(email: string, password: string, name: string) {
    try {
      const user = await this.usersRepository.createUser(email, name, password);
      return user; // el repo ya devuelve id, email, name
    } catch (err: any) {
      // si querés manejar duplicados amigables
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
}
