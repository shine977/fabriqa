import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { 
  InventoryCreatedEvent, 
  InventoryUpdatedEvent,
  InventoryTransactionCreatedEvent,
  LowStockEvent,
  InventoryReservedEvent,
  InventoryReservationCancelledEvent
} from '../events/inventory.events';
import { Logger } from '@nestjs/common';

@Injectable()
export class InventoryEventListeners {
  private readonly logger = new Logger(InventoryEventListeners.name);

  constructor() {}

  @OnEvent('inventory.created')
  handleInventoryCreatedEvent(event: InventoryCreatedEvent) {
    this.logger.log(
      `Inventory created: ${event.inventory.id} - ${event.inventory.material?.name} - Quantity: ${event.inventory.quantity}`
    );
    // Additional logic for inventory creation events
    // e.g., Notify relevant departments, update dashboards, etc.
  }

  @OnEvent('inventory.updated')
  handleInventoryUpdatedEvent(event: InventoryUpdatedEvent) {
    this.logger.log(
      `Inventory updated: ${event.inventory.id} - ${event.inventory.material?.name}`
    );
    
    // Check for significant changes that might require notifications
    if (
      event.previousValues.quantity !== undefined && 
      event.inventory.quantity !== event.previousValues.quantity
    ) {
      this.logger.log(
        `Quantity changed from ${event.previousValues.quantity} to ${event.inventory.quantity}`
      );
    }
    
    // Additional logic for inventory update events
  }

  @OnEvent('inventory.transaction.created')
  handleInventoryTransactionCreatedEvent(event: InventoryTransactionCreatedEvent) {
    this.logger.log(
      `Inventory transaction created: ${event.transaction.id} - Type: ${event.transaction.transactionType} - Quantity: ${event.transaction.quantity}`
    );
    // Additional logic for transaction events
    // e.g., Update analytics, trigger workflows based on transaction type
  }

  @OnEvent('inventory.low_stock')
  handleLowStockEvent(event: LowStockEvent) {
    this.logger.warn(
      `LOW STOCK ALERT: ${event.inventory.material?.name} (${event.inventory.id}) - Current: ${event.currentQuantity}, Threshold: ${event.threshold}`
    );
    
    // Additional logic for low stock events
    // e.g., Send notifications to procurement team, create purchase orders automatically
  }

  @OnEvent('inventory.reserved')
  handleInventoryReservedEvent(event: InventoryReservedEvent) {
    this.logger.log(
      `Inventory reserved: ${event.inventory.id} - ${event.inventory.material?.name} - Quantity: ${event.quantity} - Reference: ${event.referenceNo || 'N/A'}`
    );
    // Additional logic for reservation events
  }

  @OnEvent('inventory.reservation_cancelled')
  handleInventoryReservationCancelledEvent(event: InventoryReservationCancelledEvent) {
    this.logger.log(
      `Inventory reservation cancelled: ${event.inventory.id} - ${event.inventory.material?.name} - Quantity: ${event.quantity} - Reference: ${event.referenceNo || 'N/A'}`
    );
    // Additional logic for reservation cancellation events
  }
}
