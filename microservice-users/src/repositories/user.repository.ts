/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { MySQLProvider } from 'src/database/database.provider';
import { User } from '../interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { UpdateUserDTO } from 'src/dto/updateUser.dto';

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
  async updateUser(id: number, dto: UpdateUserDTO) {
    const conn = this.mysqlProvider.getConnection();
    const fields: string[] = [];
    const values: any[] = [];

    if (dto.email) {
      fields.push('email = ?');
      values.push(dto.email);
    }
    if (dto.name) {
      fields.push('name = ?');
      values.push(dto.name);
    }
    if (dto.password) {
      const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
      const hashed = bcrypt.hashSync(dto.password, saltRounds);
      fields.push('password = ?');
      values.push(hashed);
    }

    if (fields.length === 0) return null;

    const sql = `UPDATE Users SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    await conn.execute(sql, values);

    const [rows]: any = await conn.execute(
      'SELECT id, email, name FROM Users WHERE id = ?',
      [id],
    );

    return (rows as any[])[0];
  }

  // Eliminar usuario
  async deleteUser(id: number) {
    const conn = this.mysqlProvider.getConnection();
    await conn.execute('DELETE FROM Users WHERE ID = ?', [id]);
  }
}
