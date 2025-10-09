/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controllers';
import { UsersService } from './services/user.service';
import { UsersRepository } from './repositories/user.repository';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule { }
