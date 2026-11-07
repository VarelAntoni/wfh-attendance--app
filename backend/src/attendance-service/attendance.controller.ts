import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AttendanceService } from './attendance.service';
import { CheckInDto, MonitoringQueryDto } from './dto/attendance.dto';

@Controller()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @MessagePattern('attendance.checkIn')
  async checkIn(@Payload() dto: CheckInDto) {
    try {
      return await this.attendanceService.checkIn(dto);
    } catch (err) {
      return { error: err.message };
    }
  }

  @MessagePattern('attendance.getMyHistory')
  async getMyHistory(@Payload() data: { userId: number }) {
    try {
      return await this.attendanceService.getMyHistory(data.userId);
    } catch (err) {
      return { error: err.message };
    }
  }

  @MessagePattern('attendance.getTodayStatus')
  async getTodayStatus(@Payload() data: { userId: number }) {
    try {
      return await this.attendanceService.getTodayStatus(data.userId);
    } catch (err) {
      return { error: err.message };
    }
  }

  @MessagePattern('attendance.findAllForMonitoring')
  async findAllForMonitoring(@Payload() query: MonitoringQueryDto) {
    try {
      return await this.attendanceService.findAllForMonitoring(query);
    } catch (err) {
      return { error: err.message };
    }
  }

  @MessagePattern('attendance.getStats')
  async getStats(@Payload() data: { date?: string }) {
    try {
      return await this.attendanceService.getStats(data?.date);
    } catch (err) {
      return { error: err.message };
    }
  }
}
