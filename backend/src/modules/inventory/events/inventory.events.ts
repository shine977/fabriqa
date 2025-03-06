import { InventoryEntity } from '../entities/inventory.entity';
import { InventoryTransactionEntity } from '../entities/inventory-transaction.entity';

/**
 * Event emitted when inventory is created
 */
export class InventoryCreatedEvent {
  constructor(public readonly inventory: InventoryEntity) {}
}

/**
 * Event emitted when inventory is updated
 */
export class InventoryUpdatedEvent {
  constructor(
    public readonly inventory: InventoryEntity,
    public readonly previousValues: Partial<InventoryEntity>
  ) {}
}

/**
 * Event emitted when inventory is deleted
 */
export class InventoryDeletedEvent {
  constructor(public readonly inventoryId: string) {}
}

/**
 * Event emitted when inventory transaction is created
 */
export class InventoryTransactionCreatedEvent {
  constructor(public readonly transaction: InventoryTransactionEntity) {}
}

/**
 * Event emitted when inventory quantity falls below threshold
 */
export class LowStockEvent {
  constructor(
    public readonly inventory: InventoryEntity,
    public readonly currentQuantity: number,
    public readonly threshold: number
  ) {}
}

/**
 * Event emitted when inventory is reserved
 */
export class InventoryReservedEvent {
  constructor(
    public readonly inventory: InventoryEntity,
    public readonly quantity: number,
    public readonly referenceNo?: string,
    public readonly referenceType?: string
  ) {}
}

/**
 * Event emitted when inventory reservation is cancelled
 */
export class InventoryReservationCancelledEvent {
  constructor(
    public readonly inventory: InventoryEntity,
    public readonly quantity: number,
    public readonly referenceNo?: string,
    public readonly referenceType?: string
  ) {}
}
