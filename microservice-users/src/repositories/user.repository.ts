/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Usuario demo inicial (password '123456')
const demoPasswordHash = bcrypt.hashSync('123456', 10);

@Injectable()
export class UsersRepository {
  // arreglo in-memory (id, email, name, passwordHash)
  private users = [
    { id: 1, email: 'admin@cobradores.com', name: 'Admin', passwordHash: demoPasswordHash },
    { id: 2, email: 'user@cobradores.com', name: 'User', passwordHash: bcrypt.hashSync('pass', 10) },
  ];

  async findByEmail(email: string) {
    return this.users.find(u => u.email === email) || null;
  }

  // método para "crear" usuarios (opcional)
  async createUser(email: string, name: string, plainPassword: string) {
    const hash = await bcrypt.hash(plainPassword, 10);
    const newUser = { id: Date.now(), email, name, passwordHash: hash };
    this.users.push(newUser);
    return newUser;
  }
}
