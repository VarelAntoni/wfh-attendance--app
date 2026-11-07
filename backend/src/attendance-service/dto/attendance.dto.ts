export class CheckInDto {
  userId: number;
  photoUrl: string;
  notes?: string;
  attendanceDate?: string;
  checkInTime?: string | Date;
}

export class MonitoringQueryDto {
  date?: string;
  search?: string;
  departmentId?: number;
}
