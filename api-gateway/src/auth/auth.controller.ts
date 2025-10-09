/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, Body, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoginDto } from '../dto/login.dto';
import { AuthService } from './auth.service';
import { firstValueFrom, timeout } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject('USERS_SERVICE') private readonly client: ClientProxy
  ) { }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    // send RPC request to users microservice
    const pattern = { cmd: 'auth.validate' };
    const payload = { email: dto.email, password: dto.password };

    try {
      // .send returns Observable -> await it with firstValueFrom
      const response$ = this.client.send(pattern, payload);
      // opcional: timeout en ms (ej. 5000)
      const res = await firstValueFrom(response$.pipe(timeout(5000)));
      if (!res || res.ok === false) {
        throw new HttpException(res?.error || 'Autenticación fallida', HttpStatus.UNAUTHORIZED);
      }

      // res.ok === true y res.user contiene datos
      const token = await this.authService.createJwtToken(res.user);
      return { access_token: token, user: res.user };
    } catch (err: any) {
      // distingue timeout/errores de transporte
      const message = err?.message || 'Error autenticando';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
