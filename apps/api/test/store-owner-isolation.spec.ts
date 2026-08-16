import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { StoreStatus, UserRole } from '@prisma/client';
import { StoreOwnerGuard } from '../src/shared/guards/store-owner.guard';

describe('Store Owner & Multi-Tenant Isolation Suite', () => {
  let guard: StoreOwnerGuard;
  let mockPrisma: any;
  let mockReflector: any;

  beforeEach(() => {
    mockPrisma = {
      store: {
        findFirst: jest.fn(),
      },
    };
    mockReflector = {
      getAllAndOverride: jest.fn(),
    };
    guard = new StoreOwnerGuard(mockReflector as any, mockPrisma as any);
    jest.clearAllMocks();
  });

  function createMockExecutionContext(user: { sub: string; role: UserRole } | null): ExecutionContext {
    const request: any = { user };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  }

  describe('StoreOwnerGuard — Store Scoping & Ownership', () => {
    it('throws ForbiddenException if user has no STORE_OWNER role', async () => {
      const context = createMockExecutionContext({
        sub: 'cust-1',
        role: UserRole.CUSTOMER,
      });

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException if STORE_OWNER has no associated store record in database', async () => {
      const context = createMockExecutionContext({
        sub: 'owner-without-store',
        role: UserRole.STORE_OWNER,
      });
      mockPrisma.store.findFirst.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.store.findFirst).toHaveBeenCalledWith({
        where: { ownerUserId: 'owner-without-store', deletedAt: null },
      });
    });

    it('attaches scoped store to request for legitimate store owner', async () => {
      const context = createMockExecutionContext({
        sub: 'owner-1',
        role: UserRole.STORE_OWNER,
      });
      const store = {
        id: 'store-1',
        name: 'Organic Greens',
        ownerUserId: 'owner-1',
        status: StoreStatus.LIVE,
      };
      mockPrisma.store.findFirst.mockResolvedValue(store);
      mockReflector.getAllAndOverride.mockReturnValue(false);

      const canActivate = await guard.canActivate(context);
      const req = context.switchToHttp().getRequest();

      expect(canActivate).toBe(true);
      expect(req.store).toEqual(store);
      expect(req.store.id).toBe('store-1');
    });

    it('prevents cross-tenant access — owner-1 cannot resolve store-2', async () => {
      const context = createMockExecutionContext({
        sub: 'owner-1',
        role: UserRole.STORE_OWNER,
      });
      // DB only returns store-1 for owner-1
      mockPrisma.store.findFirst.mockImplementation(({ where }: any) => {
        if (where.ownerUserId === 'owner-1') {
          return Promise.resolve({ id: 'store-1', ownerUserId: 'owner-1', status: StoreStatus.LIVE });
        }
        return Promise.resolve(null);
      });
      mockReflector.getAllAndOverride.mockReturnValue(false);

      await guard.canActivate(context);
      const req = context.switchToHttp().getRequest();

      expect(req.store.id).toBe('store-1');
      expect(req.store.id).not.toBe('store-2');
    });
  });

  describe('RequireLiveStore Gate Enforcement', () => {
    it('blocks catalog access when store is in DRAFT status', async () => {
      const context = createMockExecutionContext({
        sub: 'owner-1',
        role: UserRole.STORE_OWNER,
      });
      const draftStore = {
        id: 'store-1',
        ownerUserId: 'owner-1',
        status: StoreStatus.DRAFT,
      };
      mockPrisma.store.findFirst.mockResolvedValue(draftStore);
      // RequireLiveStore metadata set to true
      mockReflector.getAllAndOverride.mockReturnValue(true);

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('blocks catalog access when store is in PENDING status', async () => {
      const context = createMockExecutionContext({
        sub: 'owner-1',
        role: UserRole.STORE_OWNER,
      });
      const pendingStore = {
        id: 'store-1',
        ownerUserId: 'owner-1',
        status: StoreStatus.PENDING,
      };
      mockPrisma.store.findFirst.mockResolvedValue(pendingStore);
      mockReflector.getAllAndOverride.mockReturnValue(true);

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('allows access to gated routes when store is in LIVE status', async () => {
      const context = createMockExecutionContext({
        sub: 'owner-1',
        role: UserRole.STORE_OWNER,
      });
      const liveStore = {
        id: 'store-1',
        ownerUserId: 'owner-1',
        status: StoreStatus.LIVE,
      };
      mockPrisma.store.findFirst.mockResolvedValue(liveStore);
      mockReflector.getAllAndOverride.mockReturnValue(true);

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });
  });
});
