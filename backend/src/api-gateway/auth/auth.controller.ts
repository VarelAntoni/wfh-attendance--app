import { Controller, Post, Get, Body, Inject, UnauthorizedException, BadRequestException, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { EMPLOYEE_SERVICE } from '../../shared/constants';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUser } from './get-user.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(
    @Inject(EMPLOYEE_SERVICE) private readonly employeeClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email dan password wajib diisi.');
    }

    const response = await firstValueFrom(
      this.employeeClient.send('auth.validate_user', {
        email: body.email.trim(),
        pass: body.password,
      }),
    );

    if (!response) {
      throw new UnauthorizedException('Email atau password tidak sesuai.');
    }

    if (response.error) {
      throw new UnauthorizedException(response.error);
    }

    const payload = {
      sub: response.id,
      email: response.email,
      nip: response.nip,
      fullName: response.fullName,
      role: response.role,
      departmentId: response.departmentId,
      department: response.department?.name,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Login berhasil.',
      accessToken,
      user: payload,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: any) {
    return user;
  }

  @Post('seed')
  async seed() {
    return firstValueFrom(this.employeeClient.send('seed.database', {}));
  }
}
