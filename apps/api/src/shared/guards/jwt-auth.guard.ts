// Implements v3 §0.2 — JWT auth guard
// Sets actorId in CLS on every authenticated request so Prisma extensions
// can populate createdBy/updatedBy without manual threading.

import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ActorContextService } from '../cls/actor-context.service';
import { JwtPayload } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly actorCtx: ActorContextService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }

  handleRequest<T = JwtPayload>(err: Error | null, user: T): T {
    if (err || !user) {
      throw err ?? new UnauthorizedException('Invalid or missing token');
    }
    // Thread actor id into CLS so Prisma extensions can pick it up
    this.actorCtx.setActorId((user as unknown as JwtPayload).sub);
    return user;
  }
}
