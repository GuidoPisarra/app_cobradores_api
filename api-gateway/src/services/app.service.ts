import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  validateUser(username: string, password: string): boolean {
    // Aquí iría la lógica real (base de datos, etc)
    return username === 'admin' && password === '1234';
  }
}
