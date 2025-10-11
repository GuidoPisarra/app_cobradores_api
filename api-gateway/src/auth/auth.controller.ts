/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, Body, Inject, HttpException, HttpStatus, Delete, UseGuards, Param, Patch, ParseIntPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoginDTO } from '../dto/users/login.dto';
import { AuthService } from './auth.service';
import { firstValueFrom, timeout } from 'rxjs';
import { NewUserDTO } from '../dto/users/newUser.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDTO } from '../dto/users/updateUser.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject('USERS_SERVICE') private readonly client: ClientProxy
  ) { }

  @Post('login')
  async login(@Body() dto: LoginDTO) {
    // send RPC request to users microservice
    const pattern = { cmd: 'auth.validate' };
    const payload = { email: dto.email, password: dto.password };

    try {
      // .send devuelve Observable -> await se queda con firstValueFrom
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


  @Post('create_user')
  async createUser(@Body() dto: NewUserDTO) {
    // send RPC request to users microservice
    const pattern = { cmd: 'auth.new_user' };
    const payload = { email: dto.email, password: dto.password, name: dto.name };

    try {
      // .send devuelve Observable -> await se queda con firstValueFrom
      const response$ = this.client.send(pattern, payload);
      // opcional: timeout en ms (ej. 5000)
      const res = await firstValueFrom(response$.pipe(timeout(5000)));
      if (!res || res.ok === false) {
        throw new HttpException(res?.error || 'Creación fallida', HttpStatus.UNAUTHORIZED);
      }


      return { user: res.user };
    } catch (err: any) {
      // distingue timeout/errores de transporte
      const message = err?.message || 'Error creando usuario';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @UseGuards(AuthGuard('jwt'))
  @Delete('delete_user/:id')
  async deleteUser(@Param('id') idParam: string) {
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
    }

    const pattern = { cmd: 'auth.delete_user' };
    const payload = { id };

    try {
      const response$ = this.client.send(pattern, payload);
      const res = await firstValueFrom(response$.pipe(timeout(5000)));

      if (!res || res.ok === false) {
        throw new HttpException(res?.error || 'Eliminación fallida', HttpStatus.UNAUTHORIZED);
      }

      return { user: res.user };
    } catch (err: any) {
      const message = err?.message || 'Error eliminando usuario';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('update_user/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDTO
  ) {
    const pattern = { cmd: 'users.update' };
    const payload = { id, dto };

    try {
      const response$ = this.client.send(pattern, payload);
      const updatedUser = await firstValueFrom(response$.pipe(timeout(5000)));

      if (!updatedUser) {
        throw new HttpException('Actualización fallida', HttpStatus.BAD_REQUEST);
      }

      return { user: updatedUser };
    } catch (err: any) {
      throw new HttpException(err?.message || 'Error actualizando usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


}
