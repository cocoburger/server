import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Gender } from '../users/enums/user.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    deleteAccount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Test123!@#',
        name: '홍길동',
        gender: Gender.MALE,
        country: 'KR',
      };

      mockAuthService.register.mockResolvedValue({ accessToken: 'mock-token' });

      const result = await controller.register(registerDto);

      expect(result).toEqual({ accessToken: 'mock-token' });
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      const expectedResult = { accessToken: 'mock-token' };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('getProfile', () => {
    it('프로필 조회 성공', async () => {
      // Arrange
      const mockUser = {
        sub: 'userId',
        email: 'test@example.com',
        name: '홍길동',
      };
      const mockRequest = { user: mockUser }; // 명시적인 mockRequest 객체 생성

      // Act
      const result = await controller.getProfile(mockRequest as any); // 타입 단언 사용

      // Assert
      expect(result).toEqual(mockUser);
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      const mockUser = {
        sub: '123',
        email: 'test@example.com',
      };

      const mockReq = { user: mockUser };
      await controller.deleteAccount(mockReq);

      expect(authService.deleteAccount).toHaveBeenCalledWith(mockUser.sub);
    });
  });
});
