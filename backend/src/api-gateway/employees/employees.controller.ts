import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  UseGuards,
  BadRequestException,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { EMPLOYEE_SERVICE, UserRole } from '../../shared/constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN_HRD)
export class EmployeesController {
  constructor(
    @Inject(EMPLOYEE_SERVICE) private readonly employeeClient: ClientProxy,
  ) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    const deptId = departmentId ? parseInt(departmentId, 10) : undefined;
    const response = await firstValueFrom(
      this.employeeClient.send('employee.findAll', { search, departmentId: deptId }),
    );
    if (response?.error) {
      throw new BadRequestException(response.error);
    }
    return response;
  }

  @Get('departments')
  async findDepartments() {
    const response = await firstValueFrom(
      this.employeeClient.send('department.findAll', {}),
    );
    if (response?.error) {
      throw new BadRequestException(response.error);
    }
    return response;
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const response = await firstValueFrom(
      this.employeeClient.send('employee.findOne', { id }),
    );
    if (response?.error) {
      throw new NotFoundException(response.error);
    }
    return response;
  }

  @Post()
  async create(@Body() body: any) {
    if (!body.nip || !body.fullName || !body.email) {
      throw new BadRequestException('NIP, Nama Lengkap, dan Email wajib diisi.');
    }
    const response = await firstValueFrom(
      this.employeeClient.send('employee.create', body),
    );
    if (response?.error) {
      throw new BadRequestException(response.error);
    }
    return response;
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const response = await firstValueFrom(
      this.employeeClient.send('employee.update', { id, dto: body }),
    );
    if (response?.error) {
      throw new BadRequestException(response.error);
    }
    return response;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const response = await firstValueFrom(
      this.employeeClient.send('employee.remove', { id }),
    );
    if (response?.error) {
      throw new BadRequestException(response.error);
    }
    return response;
  }
}
