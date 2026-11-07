import { Injectable, OnModuleInit, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../shared/entities/user.entity';
import { Department } from '../shared/entities/department.entity';
import { UserRole, UserStatus } from '../shared/constants';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

@Injectable()
export class EmployeeService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async onModuleInit() {
    await this.seedInitialData();
  }

  async seedInitialData() {
    // 1. Seed Departments if empty
    const deptCount = await this.departmentRepository.count();
    let itDept: Department;
    let hrdDept: Department;

    if (deptCount === 0) {
      itDept = await this.departmentRepository.save(
        this.departmentRepository.create({
          name: 'IT & Software Engineering',
          description: 'Tim pengembangan dan infrastruktur teknologi informasi',
        }),
      );
      hrdDept = await this.departmentRepository.save(
        this.departmentRepository.create({
          name: 'Human Resources Development',
          description: 'Pengelolaan SDM, rekrutmen, dan operasional kepegawaian',
        }),
      );
      await this.departmentRepository.save(
        this.departmentRepository.create({
          name: 'Finance & Operations',
          description: 'Manajemen keuangan dan operasional perusahaan',
        }),
      );
      await this.departmentRepository.save(
        this.departmentRepository.create({
          name: 'Marketing & Growth',
          description: 'Pemasaran dan ekspansi bisnis',
        }),
      );
    } else {
      itDept = await this.departmentRepository.findOne({ where: { name: Like('%IT%') } });
      hrdDept = await this.departmentRepository.findOne({ where: { name: Like('%Human%') } });
    }

    // 2. Seed Users if empty
    const userCount = await this.userRepository.count();
    if (userCount === 0) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      const karyawanHash = await bcrypt.hash('karyawan123', 10);

      // Seed HRD Admin
      await this.userRepository.save(
        this.userRepository.create({
          nip: 'HRD-001',
          fullName: 'Bambang HRD Manager',
          email: 'admin@company.com',
          passwordHash: passwordHash,
          role: UserRole.ADMIN_HRD,
          departmentId: hrdDept ? hrdDept.id : null,
          position: 'HRD Manager',
          phone: '081234567890',
          status: UserStatus.ACTIVE,
        }),
      );

      // Seed Karyawan 1
      await this.userRepository.save(
        this.userRepository.create({
          nip: 'EMP-001',
          fullName: 'Ahmad Fauzi (Karyawan WFH)',
          email: 'karyawan@company.com',
          passwordHash: karyawanHash,
          role: UserRole.KARYAWAN,
          departmentId: itDept ? itDept.id : null,
          position: 'Fullstack Developer',
          phone: '081298765432',
          status: UserStatus.ACTIVE,
        }),
      );

      // Seed Karyawan 2
      await this.userRepository.save(
        this.userRepository.create({
          nip: 'EMP-002',
          fullName: 'Siti Rahmawati',
          email: 'siti@company.com',
          passwordHash: karyawanHash,
          role: UserRole.KARYAWAN,
          departmentId: itDept ? itDept.id : null,
          position: 'UI/UX Designer',
          phone: '081311223344',
          status: UserStatus.ACTIVE,
        }),
      );

      console.log(' [EmployeeService] Seed initial data completed successfully.');
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['department'],
    });

    if (!user) {
      return null;
    }

    if (user.status !== UserStatus.ACTIVE) {
      return { error: 'Akun Anda dinonaktifkan. Silakan hubungi HRD.' };
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      return null;
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async findAll(search?: string, departmentId?: number): Promise<User[]> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department')
      .orderBy('user.id', 'DESC');

    if (search && search.trim() !== '') {
      query.andWhere(
        '(LOWER(user.fullName) LIKE LOWER(:s) OR LOWER(user.nip) LIKE LOWER(:s) OR LOWER(user.email) LIKE LOWER(:s) OR LOWER(user.position) LIKE LOWER(:s))',
        { s: `%${search.trim()}%` },
      );
    }

    if (departmentId) {
      query.andWhere('user.departmentId = :deptId', { deptId: departmentId });
    }

    const users = await query.getMany();
    return users.map((u) => {
      const { passwordHash, ...safeUser } = u;
      return safeUser as any;
    });
  }

  async findOne(id: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['department'],
    });

    if (!user) {
      throw new NotFoundException(`Karyawan dengan ID ${id} tidak ditemukan.`);
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async create(dto: CreateEmployeeDto): Promise<any> {
    // Check email uniqueness
    const existingEmail = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existingEmail) {
      throw new ConflictException('Email sudah digunakan oleh karyawan lain.');
    }

    // Check NIP uniqueness
    const existingNip = await this.userRepository.findOne({ where: { nip: dto.nip } });
    if (existingNip) {
      throw new ConflictException('NIP sudah digunakan oleh karyawan lain.');
    }

    const passwordToHash = dto.password || 'karyawan123';
    const passwordHash = await bcrypt.hash(passwordToHash, 10);

    const user = this.userRepository.create({
      ...dto,
      passwordHash,
      role: dto.role || UserRole.KARYAWAN,
      status: dto.status || UserStatus.ACTIVE,
    });

    const saved = await this.userRepository.save(user);
    const { passwordHash: _, ...safeUser } = saved;
    return safeUser;
  }

  async update(id: number, dto: UpdateEmployeeDto): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Karyawan dengan ID ${id} tidak ditemukan.`);
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findOne({ where: { email: dto.email } });
      if (existing) {
        throw new ConflictException('Email sudah terdaftar.');
      }
      user.email = dto.email;
    }

    if (dto.nip && dto.nip !== user.nip) {
      const existing = await this.userRepository.findOne({ where: { nip: dto.nip } });
      if (existing) {
        throw new ConflictException('NIP sudah terdaftar.');
      }
      user.nip = dto.nip;
    }

    if (dto.fullName) user.fullName = dto.fullName;
    if (dto.position !== undefined) user.position = dto.position;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.departmentId !== undefined) user.departmentId = dto.departmentId;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.status !== undefined) user.status = dto.status;

    if (dto.password && dto.password.trim() !== '') {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.userRepository.save(user);
    const { passwordHash: _, ...safeUser } = updated;
    return safeUser;
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Karyawan dengan ID ${id} tidak ditemukan.`);
    }

    // Do not allow deleting the main admin
    if (user.role === UserRole.ADMIN_HRD && user.nip === 'HRD-001') {
      throw new ConflictException('Akun Admin HRD Utama tidak boleh dihapus.');
    }

    await this.userRepository.delete(id);
    return { success: true, message: `Karyawan ${user.fullName} berhasil dihapus.` };
  }

  async findAllDepartments(): Promise<Department[]> {
    return this.departmentRepository.find({ order: { name: 'ASC' } });
  }
}
