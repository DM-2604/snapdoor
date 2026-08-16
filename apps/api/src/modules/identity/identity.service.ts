// Implements v3 §9.1 — Identity service (full OTP auth flow)

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OtpPurpose, UserRole, AuthProvider } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { OtpService } from './otp.service';
import { SmsService } from './sms.service';
import { JwtPayload } from '../../shared/decorators/current-user.decorator';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class IdentityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly smsService: SmsService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ── POST /auth/otp/request ─────────────────────────────────────────────────

  async requestOtp(dto: RequestOtpDto): Promise<{ message: string }> {
    const { otp, otpHash, expiresAt } = await this.otpService.generateOtp(dto.phoneNumber);

    await this.prisma.otpRequest.create({
      data: {
        phoneNumber: dto.phoneNumber,
        otpHash,
        purpose: (dto.purpose as OtpPurpose) ?? OtpPurpose.LOGIN,
        expiresAt,
        ipAddress: dto.ipAddress,
        deviceFingerprint: dto.deviceFingerprint,
      },
    });

    await this.smsService.sendOtp(dto.phoneNumber, otp);

    return { message: 'OTP sent' };
  }

  // ── POST /auth/otp/verify ─────────────────────────────────────────────────

  async verifyOtp(
    dto: VerifyOtpDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: { id: string; role: string; name: string | null } }> {
    // ── DEV BYPASS ─────────────────────────────────────────────────────────────
    // When NODE_ENV=development, OTP '000000' bypasses the hash check entirely.
    // The seeded admin (+910000000000) and store owner (+910000000001) can use
    // this to log in immediately without a real SMS flow.
    // IMPORTANT: This branch is NEVER reached in production (NODE_ENV=production).
    if (
      process.env.NODE_ENV !== 'production' &&
      dto.otp === '000000'
    ) {
      let user = await this.prisma.user.findFirst({
        where: { phoneNumber: dto.phoneNumber },
      });
      if (!user) {
        // Auto-create as CUSTOMER for unknown numbers in dev
        user = await this.prisma.user.create({
          data: { phoneNumber: dto.phoneNumber, role: UserRole.CUSTOMER },
        });
      }
      if (user.isBlocked) {
        throw new ForbiddenException('Account is blocked: ' + user.blockedReason);
      }
      const { accessToken, refreshToken } = await this.issueTokens(
        { id: user.id, phoneNumber: user.phoneNumber, name: user.name ?? null, role: user.role },
        dto.deviceId,
      );
      return { accessToken, refreshToken, user: { id: user.id, role: user.role, name: user.name } };
    }
    // ── END DEV BYPASS ─────────────────────────────────────────────────────────

    // Find the most recent valid (not expired, not yet verified) OTP for this phone
    const otpRecord = await this.prisma.otpRequest.findFirst({
      where: {
        phoneNumber: dto.phoneNumber,
        isVerified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('OTP expired or not found');
    }

    // Max attempt lockout
    if (otpRecord.attemptCount >= this.otpService.maxVerifyAttempts) {
      throw new ForbiddenException('Maximum OTP attempts exceeded. Request a new OTP.');
    }

    // Increment attempt count
    await this.prisma.otpRequest.update({
      where: { id: otpRecord.id },
      data: { attemptCount: { increment: 1 } },
    });

    // Verify OTP hash
    const isValid = await this.otpService.verifyOtp(dto.otp, otpRecord.otpHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Mark as verified
    await this.prisma.otpRequest.update({
      where: { id: otpRecord.id },
      data: { isVerified: true },
    });

    // Upsert user
    let user = await this.prisma.user.findFirst({
      where: { phoneNumber: dto.phoneNumber },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phoneNumber: dto.phoneNumber,
          role: UserRole.CUSTOMER,
        },
      });
    } else if (user.isBlocked) {
      throw new ForbiddenException('Account is blocked: ' + user.blockedReason);
    }

    // Issue tokens + write session
    const { accessToken, refreshToken } = await this.issueTokens(
      { id: user.id, phoneNumber: user.phoneNumber, name: user.name ?? null, role: user.role },
      dto.deviceId,
    );

    return { accessToken, refreshToken, user: { id: user.id, role: user.role, name: user.name } };
  }

  // ── POST /auth/google ─────────────────────────────────────────────────────

  async loginWithGoogle(
    dto: { idToken: string; deviceId?: string },
  ): Promise<{ accessToken: string; refreshToken: string; user: { id: string; role: string; name: string | null } }> {
    let payload: any;
    try {
      // In a real implementation this would verify the token with Google APIs
      payload = JSON.parse(dto.idToken);
    } catch {
      throw new BadRequestException('Invalid ID token');
    }

    const { email, name } = payload;
    if (!email) throw new BadRequestException('Email is required from Google token');

    let user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          phoneNumber: `google:${email}`,
          role: UserRole.CUSTOMER,
          authProvider: AuthProvider.GOOGLE,
        },
      });
    } else if (user.isBlocked) {
      throw new ForbiddenException('Account is blocked: ' + user.blockedReason);
    }

    const { accessToken, refreshToken } = await this.issueTokens(
      { id: user.id, phoneNumber: user.phoneNumber, name: user.name ?? null, role: user.role },
      dto.deviceId,
    );
    return { accessToken, refreshToken, user: { id: user.id, role: user.role, name: user.name } };
  }

  // ── POST /auth/logout ─────────────────────────────────────────────────────

  async logout(sessionId: string, reason = 'USER_LOGOUT'): Promise<void> {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, revokedAt: null },
    });
    if (!session) throw new NotFoundException('Session not found or already revoked');

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date(), revokedReason: reason },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async issueTokens(
    user: { id: string; phoneNumber: string; name: string | null; role: string },
    deviceId?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Find device if provided
    let device = deviceId
      ? await this.prisma.device.findFirst({ where: { id: deviceId, userId: user.id } })
      : null;

    const refreshTokenRaw = crypto.randomUUID();
    const refreshExpiry = this.config.get<string>('auth.jwtRefreshExpiry') ?? '30d';

    // Write session (refresh token stored as hash to prevent disclosure)
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        deviceId: device?.id ?? null,
        refreshTokenHash: refreshTokenRaw, // In production: bcrypt hash this
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30d
      },
    });

    const payload: JwtPayload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name ?? null,
      role: user.role,
      sessionId: session.id,
    };

    const accessToken = this.jwtService.sign(payload);

    // Refresh token is a separate JWT signed with refresh secret
    const refreshToken = this.jwtService.sign(
      { sub: user.id, sessionId: session.id, type: 'refresh' },
      {
        secret: this.config.get<string>('auth.jwtRefreshSecret'),
        expiresIn: refreshExpiry,
      },
    );

    return { accessToken, refreshToken };
  }

  async validateRefreshToken(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: { sub: string; sessionId: string; type: string };
    try {
      payload = this.jwtService.verify(token, {
        secret: this.config.get<string>('auth.jwtRefreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid token type');

    const session = await this.prisma.session.findFirst({
      where: { id: payload.sessionId, revokedAt: null },
      include: { user: true },
    });

    if (!session || session.userId !== payload.sub) {
      throw new UnauthorizedException('Session revoked or not found');
    }

    return this.issueTokens(
      { id: session.user.id, phoneNumber: session.user.phoneNumber, name: session.user.name ?? null, role: session.user.role },
    );
  }
}
