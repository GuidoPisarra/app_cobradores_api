/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { MySQLProvider } from 'src/database/database.provider';
import { User } from '../interfaces/user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersRepository {
  constructor(private readonly mysqlProvider: MySQLProvider) { }

  // Crear usuario
  async createUser(email: string, name: string, password: string) {
    const conn = this.mysqlProvider.getConnection();
    const passwordHash = bcrypt.hashSync(password, 10);

    const [result] = await conn.execute(
      'INSERT INTO Users (email, name, password) VALUES (?, ?, ?)',
      [email, name, passwordHash],
    );
    console.log(result);
    return result;
  }

  // Buscar usuario por email
  async findByEmail(email: string): Promise<User | null> {
    const conn = this.mysqlProvider.getConnection();
    const [rows] = await conn.execute('SELECT * FROM Users WHERE email = ?', [email]);

    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  // Actualizar usuario
  async updateUser(id: number, name: string) {
    const conn = this.mysqlProvider.getConnection();
    await conn.execute('UPDATE Users SET name = ? WHERE id = ?', [name, id]);
  }
}
