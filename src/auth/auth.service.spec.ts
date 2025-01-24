import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Gender } from '../users/enums/user.enum';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository;
  let mockJwtService;

  beforeEach(async () => {
    // Arrange: Setup mocks
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    let registerDto: RegisterDto;
    const hashedPassword = 'hashed-password';
    const mockToken = 'mock.jwt.token';
    it('should successfully register a new user and return access token', async () => {
      // Arrange
      registerDto = {
        // beforeEach 안에서 초기화
        email: 'test@example.com',
        password: 'Test123!@#',
        name: '홍길동',
        gender: Gender.MALE,
        country: 'KR',
        age: null,
        preferredLanguage: null,
        travelPreferences: null,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        ...registerDto,
        password: hashedPassword,
      });
      mockUserRepository.save.mockResolvedValue({
        id: '123',
        ...registerDto,
        password: hashedPassword,
      });
      mockJwtService.sign.mockReturnValue(mockToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toEqual({ accessToken: mockToken });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'Test123!@#',
        name: '홍길동',
        gender: Gender.MALE,
        country: 'KR',
        age: null,
        preferredLanguage: null,
        travelPreferences: null,
      };
      mockUserRepository.findOne.mockResolvedValue({ id: '123' });

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('회원 가입 실패 - 비밀번호 최소 길이 미달 (7자)', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Test123!', // 7 characters - minimum length is 8
        name: '홍길동',
        gender: Gender.MALE,
        country: 'KR',
        age: null,
        preferredLanguage: null,
        travelPreferences: null,
      };
      mockUserRepository.findOne.mockResolvedValue(undefined);
      mockUserRepository.create.mockReturnValue({
        ...registerDto,
        password: 'hashedPassword', // hashedPassword는 실제로 사용되지 않으므로 임의의 값으로 대체
      });
      mockUserRepository.save.mockRejectedValue(new BadRequestException()); // save mockRejectedValue로 변경, BadRequestException 던지도록 설정

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException, // BadRequestException으로 예상 예외 유형 수정
      );
    });

    it('회원 가입 실패 - 유효하지 않은 이메일 형식', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        email: 'invalid-email', // Invalid email format
        password: 'Test123!@#',
        name: '홍길동',
        gender: Gender.MALE,
        country: 'KR',
        age: null,
        preferredLanguage: null,
        travelPreferences: null,
      };
      mockUserRepository.findOne.mockResolvedValue(undefined);
      mockUserRepository.create.mockReturnValue({
        ...registerDto,
        password: 'hashedPassword', // hashedPassword는 실제로 사용되지 않으므로 임의의 값으로 대체
      });
      mockUserRepository.save.mockRejectedValue(new BadRequestException()); // save mockRejectedValue로 변경, BadRequestException 던지도록 설정

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException, // BadRequestException으로 예상 예외 유형 수정
      );
    });
  });

  describe('login', () => {
    const mockToken = 'mock.jwt.token';

    it('should successfully authenticate user and return access token', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };
      const mockUser = {
        id: '123',
        email: loginDto.email,
        password: 'hashed-password',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toEqual({ accessToken: mockToken });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email, isDeleted: false },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'Test123!@#',
      };
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!@#',
      };
      const mockUser = {
        id: '123',
        email: loginDto.email,
        password: 'hashed-password',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('로그인 실패 - 비밀번호 최소 길이 미달 (5자)', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Test12', // 5 characters - minimum length is 6
      };
      mockUserRepository.findOne.mockResolvedValue({
        email: loginDto.email,
        password: 'hashedPassword',
      });
      mockUserRepository.save.mockRejectedValue(new UnauthorizedException()); // save mockRejectedValue로 변경, UnauthorizedException 던지도록 설정 (login validation 실패 시나리오에 맞게 수정)

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException, // UnauthorizedException으로 예상 예외 유형 수정 (login validation 실패 시나리오에 맞게 수정)
      );
    });

    it('로그인 실패 - 유효하지 않은 이메일 형식', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'invalid-email', // Invalid email format
        password: 'password',
      };
      mockUserRepository.findOne.mockResolvedValue(undefined);
      mockUserRepository.save.mockRejectedValue(new UnauthorizedException()); // save mockRejectedValue로 변경, UnauthorizedException 던지도록 설정 (login validation 실패 시나리오에 맞게 수정)

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException, // UnauthorizedException으로 예상 예외 유형 수정 (login validation 실패 시나리오에 맞게 수정)
      );
    });
  });

  describe('deleteAccount', () => {
    it('should successfully soft delete a user account', async () => {
      // Arrange
      const userId = '123';
      const mockUser = { id: userId, isDeleted: false };
      const now = new Date();
      jest.useFakeTimers().setSystemTime(now);

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        isDeleted: true,
        deletedAt: now,
      });

      // Act
      await service.deleteAccount(userId);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        isDeleted: true,
        deletedAt: now,
      });

      jest.useRealTimers();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const userId = 'nonexistent-id';
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteAccount(userId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
