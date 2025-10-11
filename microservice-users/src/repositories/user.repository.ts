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

    const saltEnv = process.env.BCRYPT_SALT_ROUNDS || '10';
    const saltRounds = Number.isFinite(Number(saltEnv)) ? parseInt(saltEnv, 10) : 10;

    const passwordHash = bcrypt.hashSync(password, saltRounds);

    const [result]: any = await conn.execute(
      'INSERT INTO Users (email, name, password) VALUES (?, ?, ?)',
      [email, name, passwordHash],
    );

    return {
      id: result.insertId,
      email,
      name,
    };
  }

  // Buscar usuario por email
  async findByEmail(email: string): Promise<User | null> {
    const conn = this.mysqlProvider.getConnection();
    const [rows]: any = await conn.execute('SELECT * FROM Users WHERE email = ?', [email]);

    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  // Actualizar usuario
  async updateUser(id: number, name: string) {
    const conn = this.mysqlProvider.getConnection();
    await conn.execute('UPDATE Users SET name = ? WHERE id = ?', [name, id]);
  }

  // Eliminar usuario
  async deleteUser(id: number) {
    const conn = this.mysqlProvider.getConnection();
    await conn.execute('DELETE FROM Users WHERE ID = ?', [id]);
  }
}
