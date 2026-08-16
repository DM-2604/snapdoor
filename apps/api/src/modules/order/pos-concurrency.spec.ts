import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../shared/database/prisma.service';
import { EventBusService } from '../../shared/events/event-bus.service';
import { CommissionResolverService } from '../platform-config/commission-resolver.service';
import { InventoryService } from '../inventory/inventory.service';
import { OrderService } from './order.service';
import { PaymentMethod, StoreStatus, OrderStatus, OrderChannel } from '@prisma/client';
import { PaymentService } from '../payment/payment.service';
import { ActorContextService } from '../../shared/cls/actor-context.service';

/**
 * Concurrency Test for POS Orders
 * Verifies that two simultaneous walk-in orders for the last unit of stock
 * are correctly handled by the database row-locking mechanisms, preventing overselling.
 */
describe('POS Order Concurrency', () => {
  jest.setTimeout(30000); // E2E tests need more time
  
  let orderService: OrderService;
  let prisma: PrismaService;
  
  let storeId: string;
  let productVariantId: string;
  let categoryId: string;
  let cityId: string;
  let ownerId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        PrismaService,
        { provide: EventBusService, useValue: { emit: jest.fn() } },
        InventoryService,
        PaymentService,
        {
          provide: CommissionResolverService,
          useValue: {
            resolve: jest.fn().mockResolvedValue(5),
            applyEffectiveRateToStore: jest.fn(),
          },
        },
        {
          provide: ActorContextService,
          useValue: { getActorId: () => '00000000-0000-0000-0000-000000000000' },
        },
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    prisma = module.get<PrismaService>(PrismaService);
    
    // Seed data
    const city = await prisma.city.create({
      data: { name: 'Test City', state: 'Test State' },
    });
    cityId = city.id;

    const owner = await prisma.user.create({
      data: { phoneNumber: '1234567890', role: 'STORE_OWNER' },
    });
    ownerId = owner.id;

    const cat = await prisma.category.create({
      data: { name: 'Test Category' },
    });
    categoryId = cat.id;

    const store = await prisma.store.create({
      data: {
        ownerUserId: ownerId,
        cityId,
        storeCode: `TEST-${Date.now()}`,
        name: 'Concurrency Store',
        address: '123 Main St',
        businessCategoryId: categoryId,
        status: StoreStatus.LIVE,
      },
    });
    storeId = store.id;

    const product = await prisma.product.create({
      data: {
        storeId,
        categoryId,
        name: 'Test Product',
        basePrice: 100,
        isActive: true,
      },
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        variantName: 'Default',
        isActive: true,
      },
    });
    productVariantId = variant.id;

    await prisma.inventory.create({
      data: {
        productVariantId,
        quantity: 1, // Only 1 unit in stock
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.orderStatusHistory.deleteMany({ where: { order: { storeId } } });
    await prisma.payment.deleteMany({ where: { order: { storeId } } });
    await prisma.orderCustomerContact.deleteMany({ where: { order: { storeId } } });
    await prisma.salesInvoice.deleteMany({ where: { order: { storeId } } });
    await prisma.orderItem.deleteMany({ where: { order: { storeId } } });
    await prisma.order.deleteMany({ where: { storeId } });
    await prisma.inventoryAdjustment.deleteMany({ where: { inventory: { productVariantId } } });
    await prisma.inventory.deleteMany({ where: { productVariantId } });
    await prisma.productVariant.deleteMany({ where: { id: productVariantId } }); 
    await prisma.product.deleteMany({ where: { storeId } });
    await prisma.store.deleteMany({ where: { id: storeId } });
    await prisma.category.deleteMany({ where: { id: categoryId } });
    await prisma.user.deleteMany({ where: { id: ownerId } });
    await prisma.city.deleteMany({ where: { id: cityId } });
    await prisma.$disconnect();
  });

  it('should allow exactly one POS order to succeed when buying the last unit concurrently', async () => {
    const orderPromise1 = orderService.createPosOrder(
      storeId,
      {
        items: [{ productVariantId, quantity: 1 }],
        paymentMethod: PaymentMethod.COD,
      },
      ownerId,
    );

    const orderPromise2 = orderService.createPosOrder(
      storeId,
      {
        items: [{ productVariantId, quantity: 1 }],
        paymentMethod: PaymentMethod.COD,
      },
      ownerId,
    );

    const results = await Promise.allSettled([orderPromise1, orderPromise2]);

    const successes = results.filter((r) => r.status === 'fulfilled');
    const failures = results.filter((r) => r.status === 'rejected');

    // Exactly one should succeed, exactly one should fail due to row lock / insufficient stock
    expect(successes.length).toBe(1);
    expect(failures.length).toBe(1);

    const inventory = await prisma.inventory.findFirst({
      where: { productVariantId },
    });

    expect(inventory?.quantity).toBe(0); // The single unit is consumed
  });
});
