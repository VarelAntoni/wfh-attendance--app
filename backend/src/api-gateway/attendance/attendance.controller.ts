import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Inject,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { firstValueFrom } from 'rxjs';
import { ATTENDANCE_SERVICE, UserRole } from '../../shared/constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';

// Ensure upload directory exists
const uploadDir = join(process.cwd(), 'uploads', 'attendance');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@Controller('api/attendance')
export class AttendanceController {
  constructor(
    @Inject(ATTENDANCE_SERVICE) private readonly attendanceClient: ClientProxy,
  ) {}

  @Post('check-in')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname) || '.jpg';
          cb(null, `wfh-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    }),
  )
  async checkIn(
    @GetUser() user: any,
    @UploadedFile() file?: Express.Multer.File,
    @Body() body?: { notes?: string; photoBase64?: string },
  ) {
    let photoUrl = '';

    if (file) {
      photoUrl = `/uploads/attendance/${file.filename}`;
    } else if (body?.photoBase64) {
      // Handle base64 snapshot directly from custom webcam component
      const matches = body.photoBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new BadRequestException('Format foto base64 tidak valid.');
      }
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = `wfh-webcam-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
      const filepath = join(uploadDir, filename);
      fs.writeFileSync(filepath, buffer);
      photoUrl = `/uploads/attendance/${filename}`;
    } else {
      throw new BadRequestException('Foto bukti WFH wajib dilampirkan via webcam atau upload.');
    }

    const response = await firstValueFrom(
      this.attendanceClient.send('attendance.checkIn', {
        userId: user.userId,
        photoUrl,
        notes: body?.notes || 'Bekerja Dari Rumah (WFH)',
      }),
    );

    if (response?.error) {
      throw new BadRequestException(response.error);
    }

    return response;
  }

  @Get('my-history')
  @UseGuards(JwtAuthGuard)
  async getMyHistory(@GetUser() user: any) {
    const response = await firstValueFrom(
      this.attendanceClient.send('attendance.getMyHistory', { userId: user.userId }),
    );
    if (response?.error) {
      throw new BadRequestException(response.error);
    }
    return response;
  }

  @Get('today-status')
  @UseGuards(JwtAuthGuard)
  async getTodayStatus(@GetUser() user: any) {
    const response = await firstValueFrom(
      this.attendanceClient.send('attendance.getTodayStatus', { userId: user.userId }),
    );
    if (response?.error) {
      throw new BadRequestException(response.error);
    }
    return response;
  }

  @Get('monitoring')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN_HRD)
  async getMonitoring(
    @Query('date') date?: string,
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    const deptId = departmentId ? parseInt(departmentId, 10) : undefined;
    const response = await firstValueFrom(
      this.attendanceClient.send('attendance.findAllForMonitoring', {
        date,
        search,
        departmentId: deptId,
      }),
    );
    if (response?.error) {
      throw new BadRequestException(response.error);
    }
    return response;
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN_HRD)
  async getStats(@Query('date') date?: string) {
    const response = await firstValueFrom(
      this.attendanceClient.send('attendance.getStats', { date }),
    );
    if (response?.error) {
      throw new BadRequestException(response.error);
    }
    return response;
  }
}
