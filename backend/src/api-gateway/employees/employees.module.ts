import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { EMPLOYEE_SERVICE } from '../../shared/constants';
import { EmployeesController } from './employees.controller';

dotenv.config();

@Module({
  imports: [
    ClientsModule.register([
      {
        name: EMPLOYEE_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.EMPLOYEE_SERVICE_HOST || '127.0.0.1',
          port: parseInt(process.env.EMPLOYEE_SERVICE_PORT, 10) || 3001,
        },
      },
    ]),
  ],
  controllers: [EmployeesController],
})
export class EmployeesModule {}
