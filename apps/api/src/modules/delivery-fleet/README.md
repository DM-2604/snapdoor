# delivery-fleet

This module is **dormant in Phase 1**, gated by `City.isDeliveryFleetEnabled`.

No controllers or routes are exposed from this module until the delivery fleet feature
is enabled for a city. The module is registered in `AppModule` so the DI container
is aware of it, but the only public interface is the `DeliveryFleetModule` itself.

When activating:
1. Flip `City.isDeliveryFleetEnabled = true` for the target city
2. Implement routes in `delivery-fleet.controller.ts`
3. Expose the controller in `delivery-fleet.module.ts`

Models owned by this module: `DeliveryPartner`, `DeliveryAssignment`
