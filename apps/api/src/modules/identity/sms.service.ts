// Implements v3 §9.1 — SMS delivery service
// In dev (no MSG91 key): logs OTP to console.
// In prod: delegates to MSG91 (implementation deferred until notifications module built).

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly isDev: boolean;

  constructor(private readonly config: ConfigService) {
    const hasKey = !!config.get<string>('sms.authKey');
    this.isDev = !hasKey || config.get('app.env') === 'development';
  }

  async sendOtp(phone: string, otp: string): Promise<void> {
    if (this.isDev) {
      this.logger.log(`[DEV] OTP for ${phone}: ${otp}`);
      return;
    }
    // TODO: Implement MSG91 API call when NotificationsModule is built
    // Reference: https://docs.msg91.com/reference/send-otp
    this.logger.warn(`[SMS] MSG91 not configured — OTP not sent to ${phone}`);
  }
}
