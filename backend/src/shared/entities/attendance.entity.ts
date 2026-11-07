import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { AttendanceStatus } from '../constants';

@Entity('attendances')
@Index(['userId', 'attendanceDate'], { unique: true })
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.attendances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'attendance_date', type: 'varchar', length: 10 })
  attendanceDate: string; // Format: YYYY-MM-DD

  @Column({ name: 'check_in_time' })
  checkInTime: Date;

  @Column({ name: 'photo_url', length: 255 })
  photoUrl: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
