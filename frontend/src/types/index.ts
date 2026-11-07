export type UserRole = 'ADMIN_HRD' | 'KARYAWAN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type AttendanceStatus = 'PRESENT' | 'LATE';

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  nip: string;
  fullName: string;
  email: string;
  role: UserRole;
  departmentId?: number;
  department?: Department;
  position?: string;
  phone?: string;
  status: UserStatus;
  createdAt?: string;
}

export interface Attendance {
  id: number;
  userId: number;
  user?: User;
  attendanceDate: string;
  checkInTime: string;
  photoUrl: string;
  notes?: string;
  status: AttendanceStatus;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  user: User;
}

export interface StatsResponse {
  date: string;
  totalEmployees: number;
  totalSubmitted: number;
  presentCount: number;
  lateCount: number;
  notSubmitted: number;
}
