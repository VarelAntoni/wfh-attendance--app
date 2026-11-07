import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

@Controller()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @MessagePattern('auth.validate_user')
  async validateUser(@Payload() data: { email: string; pass: string }) {
    try {
      return await this.employeeService.validateUser(data.email, data.pass);
    } catch (err) {
      return { error: err.message };
    }
  }

  @MessagePattern('employee.findAll')
  async findAll(@Payload() data: { search?: string; departmentId?: number }) {
    try {
      return await this.employeeService.findAll(data?.search, data?.departmentId);
    } catch (err) {
      return { error: err.message };
    }
  }

  @MessagePattern('employee.findOne')
  async findOne(@Payload() data: { id: number }) {
    try {
      return await this.employeeService.findOne(data.id);
    } catch (err) {
      return { error: err.message };
    }
  }

  @MessagePattern('employee.create')
  async create(@Payload() dto: CreateEmployeeDto) {
    try {
      return await this.employeeService.create(dto);
    } catch (err) {
      return { error: err.message };
    }
  }

  @MessagePattern('employee.update')
  async update(@Payload() data: { id: number; dto: UpdateEmployeeDto }) {
    try {
      return await this.employeeService.update(data.id, data.dto);
    } catch (err) {
      return { error: err.message };
    }
  }

  @MessagePattern('employee.remove')
  async remove(@Payload() data: { id: number }) {
    try {
      return await this.employeeService.remove(data.id);
    } catch (err) {
      return { error: err.message };
    }
  }

  @MessagePattern('department.findAll')
  async findAllDepartments() {
    try {
      return await this.employeeService.findAllDepartments();
    } catch (err) {
      return { error: err.message };
    }
  }

  @MessagePattern('seed.database')
  async seed() {
    try {
      await this.employeeService.seedInitialData();
      return { success: true, message: 'Database seeded successfully' };
    } catch (err) {
      return { error: err.message };
    }
  }
}
