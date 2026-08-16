import { Injectable } from '@nestjs/common';
import { Response } from 'express';

export interface NewOrderEvent {
  orderId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

/**
 * Single-instance SSE service — keeps a per-store map of open Response streams.
 * No Redis pub/sub in Phase 1; works correctly for a single-server deployment.
 *
 * Phase 2: replace this map with a Redis pub/sub adapter for horizontal scaling.
 */
@Injectable()
export class OrderSseService {
  private clients = new Map<string, Response[]>();

  subscribe(storeId: string, res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering
    res.flushHeaders();

    const existing = this.clients.get(storeId) ?? [];
    this.clients.set(storeId, [...existing, res]);

    // Clean up on client disconnect
    res.on('close', () => {
      const filtered = (this.clients.get(storeId) ?? []).filter((r) => r !== res);
      this.clients.set(storeId, filtered);
    });
  }

  /**
   * Push a new-order event to all connected store-admin clients for this store.
   * Called AFTER the checkout transaction commits — never inside a tx.
   */
  pushNewOrder(storeId: string, event: NewOrderEvent): void {
    const streams = this.clients.get(storeId) ?? [];
    const data = `data: ${JSON.stringify(event)}\n\n`;
    streams.forEach((res) => {
      try {
        res.write(data);
      } catch {
        // Stream was closed between check and write — harmless
      }
    });
  }

  /** Returns the number of connected clients for a store (useful for health checks) */
  getClientCount(storeId: string): number {
    return (this.clients.get(storeId) ?? []).length;
  }
}
