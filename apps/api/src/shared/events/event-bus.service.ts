// Implements v3 §0.0 — EventBus service (in-process synchronous domain events)
// Uses @nestjs/event-emitter (EventEmitter2) for synchronous domain event dispatch.
// For async cross-service events, use QueueModule (BullMQ) instead.

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEventKey } from './domain-events.const';

@Injectable()
export class EventBusService {
  constructor(private readonly emitter: EventEmitter2) {}

  emit(event: DomainEventKey, payload: Record<string, unknown>): void {
    this.emitter.emit(event, payload);
  }

  async emitAsync(event: DomainEventKey, payload: Record<string, unknown>): Promise<void> {
    await this.emitter.emitAsync(event, payload);
  }
}
