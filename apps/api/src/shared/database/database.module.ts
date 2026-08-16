// Implements v3 §0.1 — Database module

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { StoreOwnershipService } from '../services/store-ownership.service';

@Global()
@Module({
  providers: [PrismaService, StoreOwnershipService],
  exports: [PrismaService, StoreOwnershipService],
})
export class DatabaseModule {}
