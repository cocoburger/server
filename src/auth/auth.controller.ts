import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }

  @Delete('withdraw')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@Request() req) {
    await this.authService.deleteAccount(req.user.sub);
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }
}
