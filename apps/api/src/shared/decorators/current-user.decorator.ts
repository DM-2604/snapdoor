// Implements v3 §0.2 — @CurrentUser() param decorator and JwtPayload type

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  sub: string;        // user UUID
  phoneNumber: string; // always this key
  name: string | null;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtPayload;
  },
);
