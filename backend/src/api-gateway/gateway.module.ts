import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    AuthModule,
    EmployeesModule,
    AttendanceModule,
  ],
})
export class GatewayModule {}
