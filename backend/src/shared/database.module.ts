import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Department } from './entities/department.entity';
import { User } from './entities/user.entity';
import { Attendance } from './entities/attendance.entity';

dotenv.config();

function getTypeOrmConfig(): any {
  const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();

  if (dbType === 'mysql') {
    return {
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'wfh_attendance',
      entities: [Department, User, Attendance],
      synchronize: true,
      logging: false,
    };
  }

  if (dbType === 'postgres') {
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'wfh_attendance',
      entities: [Department, User, Attendance],
      synchronize: true,
      logging: false,
    };
  }

  // Default to SQLite for zero-config run
  return {
    type: 'sqlite',
    database: process.env.DB_DATABASE || 'wfh_attendance.sqlite',
    entities: [Department, User, Attendance],
    synchronize: true,
    logging: false,
  };
}

@Module({
  imports: [
    TypeOrmModule.forRoot(getTypeOrmConfig()),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
