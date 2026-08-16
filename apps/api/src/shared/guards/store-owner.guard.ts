import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../database/prisma.service';
import { REQUIRE_LIVE_STORE_KEY } from '../decorators/require-live-store.decorator';
import { JwtPayload } from '../decorators/current-user.decorator';
import { StoreStatus, UserRole } from '@prisma/client';

@Injectable()
export class StoreOwnerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;

    if (!user || !user.sub) {
      throw new ForbiddenException('User context is missing or unauthenticated');
    }

    if (user.role !== UserRole.STORE_OWNER) {
      throw new ForbiddenException('User is not a store owner');
    }

    // Resolve store owned by this user
    const store = await this.prisma.store.findFirst({
      where: {
        ownerUserId: user.sub,
        deletedAt: null,
      },
    });

    if (!store) {
      throw new NotFoundException('No store associated with this account. Please contact admin.');
    }

    // Attach store to request for @CurrentStore() decorator
    request.store = store;

    // Check @RequireLiveStore() constraint if present on handler or controller class
    const requireLive = this.reflector.getAllAndOverride<boolean>(REQUIRE_LIVE_STORE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requireLive && store.status !== StoreStatus.LIVE) {
      throw new ForbiddenException(
        `Store is not live yet. Current status: ${store.status}. Action permitted only for LIVE stores.`,
      );
    }

    return true;
  }
}
