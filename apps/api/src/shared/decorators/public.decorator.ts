// Implements v3 §0.2 — @Public() decorator (escape hatch for JwtAuthGuard)

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
