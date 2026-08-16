// Implements v3 §0.1 — actor context service
// Thin wrapper around nestjs-cls to provide typed actorId access to
// Prisma extensions without importing ClsService everywhere.

import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

export const ACTOR_ID_KEY = 'actorId';

@Injectable()
export class ActorContextService {
  constructor(private readonly cls: ClsService) {}

  getActorId(): string | undefined {
    return this.cls.get<string | undefined>(ACTOR_ID_KEY);
  }

  setActorId(userId: string): void {
    this.cls.set(ACTOR_ID_KEY, userId);
  }
}
