import { UserRole, UserStatus } from '../../shared/constants';

export class CreateEmployeeDto {
  nip: string;
  fullName: string;
  email: string;
  password?: string;
  role?: UserRole;
  departmentId?: number;
  position?: string;
  phone?: string;
  status?: UserStatus;
}

export class UpdateEmployeeDto {
  nip?: string;
  fullName?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  departmentId?: number;
  position?: string;
  phone?: string;
  status?: UserStatus;
}

export class LoginDto {
  email: string;
  password: string;
}
