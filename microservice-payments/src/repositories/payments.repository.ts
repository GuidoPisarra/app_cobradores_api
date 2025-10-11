/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { MySQLProvider } from 'src/database/database.provider';

@Injectable()
export class PaymentRepository {
  constructor(private readonly mysqlProvider: MySQLProvider) { }

}
