import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../shared/entities/attendance.entity';
import { User } from '../shared/entities/user.entity';
import { AttendanceStatus, UserRole } from '../shared/constants';
import { CheckInDto, MonitoringQueryDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async checkIn(dto: CheckInDto): Promise<any> {
    const now = new Date();
    const todayDate = dto.attendanceDate || this.getTodayDateString();

    // 1. Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
      relations: ['department'],
    });

    if (!user) {
      throw new NotFoundException(`Karyawan dengan ID ${dto.userId} tidak ditemukan.`);
    }

    // 2. Check duplicate attendance for today
    const existing = await this.attendanceRepository.findOne({
      where: {
        userId: dto.userId,
        attendanceDate: todayDate,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Anda sudah melakukan absensi WFH hari ini pada pukul ${new Date(existing.checkInTime).toLocaleTimeString('id-ID')}.`,
      );
    }

    // 3. Status determination (e.g., after 09:00 AM considered LATE, else PRESENT)
    let status = AttendanceStatus.PRESENT;
    const hours = now.getHours();
    const minutes = now.getMinutes();
    if (hours > 9 || (hours === 9 && minutes > 0)) {
      status = AttendanceStatus.LATE;
    }

    // 4. Create and save attendance record
    const attendance = this.attendanceRepository.create({
      userId: dto.userId,
      attendanceDate: todayDate,
      checkInTime: now,
      photoUrl: dto.photoUrl,
      notes: dto.notes || 'Bekerja Dari Rumah (WFH)',
      status,
    });

    const saved = await this.attendanceRepository.save(attendance);
    return {
      ...saved,
      user: {
        id: user.id,
        nip: user.nip,
        fullName: user.fullName,
        position: user.position,
        department: user.department?.name,
      },
    };
  }

  async getMyHistory(userId: number): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { userId },
      order: { id: 'DESC' },
    });
  }

  async getTodayStatus(userId: number): Promise<{ checkedIn: boolean; attendance: Attendance | null }> {
    const todayDate = this.getTodayDateString();
    const attendance = await this.attendanceRepository.findOne({
      where: {
        userId,
        attendanceDate: todayDate,
      },
    });

    return {
      checkedIn: !!attendance,
      attendance: attendance || null,
    };
  }

  async findAllForMonitoring(query: MonitoringQueryDto): Promise<Attendance[]> {
    const qb = this.attendanceRepository
      .createQueryBuilder('att')
      .leftJoinAndSelect('att.user', 'user')
      .leftJoinAndSelect('user.department', 'department')
      .orderBy('att.id', 'DESC');

    if (query?.date && query.date.trim() !== '') {
      qb.andWhere('att.attendanceDate = :date', { date: query.date.trim() });
    }

    if (query?.departmentId) {
      qb.andWhere('user.departmentId = :deptId', { deptId: query.departmentId });
    }

    if (query?.search && query.search.trim() !== '') {
      const search = `%${query.search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(user.fullName) LIKE :s OR LOWER(user.nip) LIKE :s OR LOWER(user.email) LIKE :s)',
        { s: search },
      );
    }

    return qb.getMany();
  }

  async getStats(selectedDate?: string): Promise<any> {
    const targetDate = selectedDate || this.getTodayDateString();

    const totalEmployees = await this.userRepository.count({
      where: { role: UserRole.KARYAWAN },
    });

    const todayAttendances = await this.attendanceRepository.find({
      where: { attendanceDate: targetDate },
    });

    const presentCount = todayAttendances.filter((a) => a.status === AttendanceStatus.PRESENT).length;
    const lateCount = todayAttendances.filter((a) => a.status === AttendanceStatus.LATE).length;
    const totalSubmitted = todayAttendances.length;
    const notSubmitted = Math.max(0, totalEmployees - totalSubmitted);

    return {
      date: targetDate,
      totalEmployees,
      totalSubmitted,
      presentCount,
      lateCount,
      notSubmitted,
    };
  }
}
