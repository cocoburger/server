import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  Gender,
  TransportationType,
  AccommodationType,
} from '../users/enums/user.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ accessToken: string }> {
    const { email, password, name, ...optionalData } = registerDto;

    // 이메일 중복 확인
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('이미 등록된 이메일입니다.');
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      gender: optionalData.gender || null,
      country: optionalData.country || null,
      age: optionalData.age || null,
      preferredLanguage: optionalData.preferredLanguage || null,
      travelPreferences: optionalData.travelPreferences || null,
    });
    await this.userRepository.save(user);

    // 토큰 생성
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    await this.userRepository.save(user);
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;

    // 사용자 찾기 (탈퇴하지 않은 사용자만)
    const user = await this.userRepository.findOne({
      where: {
        email,
        isDeleted: false,
      },
    });
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // 마지막 로그인 시간 업데이트
    user.lastLoginDate = new Date();
    await this.userRepository.save(user);

    // 토큰 생성
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}
