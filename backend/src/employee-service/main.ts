import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { EmployeeModule } from './employee.module';

dotenv.config();

async function bootstrap() {
  const host = process.env.EMPLOYEE_SERVICE_HOST || '127.0.0.1';
  const port = parseInt(process.env.EMPLOYEE_SERVICE_PORT, 10) || 3001;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(EmployeeModule, {
    transport: Transport.TCP,
    options: {
      host: host,
      port: port,
    },
  });

  await app.listen();
  console.log(`🚀 [EmployeeService] TCP Microservice running on ${host}:${port}`);
}

bootstrap();
