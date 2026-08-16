import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider, UserRole } from '@prisma/client';
import { IdentityService } from './identity.service';
import { OtpService } from './otp.service';
import { SmsService } from './sms.service';
import { PrismaService } from '../../shared/database/prisma.service';

const mockPrisma: any = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  session: {
    create: jest.fn().mockResolvedValue({ id: 'sess-123' }),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  device: {
    findFirst: jest.fn(),
  },
  otpRequest: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

const mockOtpService = {
  generateOtp: jest.fn(),
  verifyOtp: jest.fn(),
  maxVerifyAttempts: 3,
};

const mockSmsService = {
  sendOtp: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    if (key === 'auth.jwtRefreshExpiry') return '30d';
    if (key === 'auth.jwtRefreshSecret') return 'mock-refresh-secret';
    return null;
  }),
};

describe('IdentityService', () => {
  let service: IdentityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdentityService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: OtpService, useValue: mockOtpService },
        { provide: SmsService, useValue: mockSmsService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<IdentityService>(IdentityService);
    jest.clearAllMocks();
  });

  describe('loginWithGoogle', () => {
    it('creates a new CUSTOMER user when no user with email exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'usr-new',
        email: 'aarav@gmail.com',
        name: 'Aarav Patel',
        role: UserRole.CUSTOMER,
        authProvider: AuthProvider.GOOGLE,
      });

      const res = await service.loginWithGoogle({
        idToken: JSON.stringify({
          googleId: 'google-sub-1',
          email: 'aarav@gmail.com',
          name: 'Aarav Patel',
        }),
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'aarav@gmail.com',
            role: UserRole.CUSTOMER,
            authProvider: AuthProvider.GOOGLE,
          }),
        }),
      );
      expect(res.user.id).toBe('usr-new');
      expect(res.accessToken).toBe('mock-jwt-token');
    });

    it('links Google provider to an existing user matching the same email', async () => {
      const existingUser = {
        id: 'usr-existing',
        email: 'priya@gmail.com',
        phoneNumber: '+919876543210',
        name: 'Priya Sharma',
        role: UserRole.CUSTOMER,
        authProvider: AuthProvider.PHONE_OTP,
      };

      mockPrisma.user.findFirst.mockResolvedValue(existingUser);
      mockPrisma.user.update.mockResolvedValue({
        ...existingUser,
        authProvider: AuthProvider.GOOGLE,
      });

      const res = await service.loginWithGoogle({
        idToken: JSON.stringify({
          googleId: 'google-sub-2',
          email: 'priya@gmail.com',
          name: 'Priya Sharma',
        }),
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'usr-existing' },
          data: expect.objectContaining({
            authProvider: AuthProvider.GOOGLE,
          }),
        }),
      );
      expect(res.user.id).toBe('usr-existing');
    });
  });
});
