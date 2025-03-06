/**
 * Represents the different states an inventory item can be in
 */
export enum InventoryStatus {
  /**
   * Item is available for use or sale
   */
  AVAILABLE = 'available',
  
  /**
   * Item is reserved for a specific order or purpose
   */
  RESERVED = 'reserved',
  
  /**
   * Item is damaged and not suitable for regular use
   */
  DAMAGED = 'damaged',
  
  /**
   * Item has expired and should not be used
   */
  EXPIRED = 'expired',
  
  /**
   * Item is in transit between locations
   */
  IN_TRANSIT = 'in_transit',
  
  /**
   * Item is being inspected for quality
   */
  UNDER_INSPECTION = 'under_inspection',
  
  /**
   * Item is quarantined due to quality concerns
   */
  QUARANTINED = 'quarantined',
  
  /**
   * Item is returned and pending processing
   */
  RETURNED = 'returned'
}
