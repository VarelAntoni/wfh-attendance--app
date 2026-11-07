import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { EMPLOYEE_SERVICE } from '../../shared/constants';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

dotenv.config();

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super_secret_jwt_key_wfh_attendance_2026',
      signOptions: { expiresIn: '7d' },
    }),
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
  controllers: [AuthController],
  providers: [JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
