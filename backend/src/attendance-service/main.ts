import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { AttendanceModule } from './attendance.module';

dotenv.config();

async function bootstrap() {
  const host = process.env.ATTENDANCE_SERVICE_HOST || '127.0.0.1';
  const port = parseInt(process.env.ATTENDANCE_SERVICE_PORT, 10) || 3002;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AttendanceModule, {
    transport: Transport.TCP,
    options: {
      host: host,
      port: port,
    },
  });

  await app.listen();
  console.log(`🚀 [AttendanceService] TCP Microservice running on ${host}:${port}`);
}

bootstrap();
