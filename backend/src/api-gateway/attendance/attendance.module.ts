import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { ATTENDANCE_SERVICE } from '../../shared/constants';
import { AttendanceController } from './attendance.controller';

dotenv.config();

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ATTENDANCE_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.ATTENDANCE_SERVICE_HOST || '127.0.0.1',
          port: parseInt(process.env.ATTENDANCE_SERVICE_PORT, 10) || 3002,
        },
      },
    ]),
  ],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
