/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controllers';
import { UsersService } from './services/user.service';
import { UsersRepository } from './repositories/user.repository';
import { MySQLProvider } from './database/database.provider';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, MySQLProvider],
  exports: [MySQLProvider],
})
export class AppModule { }