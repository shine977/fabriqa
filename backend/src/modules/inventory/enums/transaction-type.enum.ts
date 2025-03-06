/**
 * Defines the different types of inventory transactions
 */
export enum TransactionType {
  /**
   * Inventory received from purchase
   */
  PURCHASE = 'purchase',
  
  /**
   * Inventory sold to customer
   */
  SALES = 'sales',
  
  /**
   * Inventory returned from customer
   */
  RETURN_FROM_CUSTOMER = 'return_from_customer',
  
  /**
   * Inventory returned to supplier
   */
  RETURN_TO_SUPPLIER = 'return_to_supplier',
  
  /**
   * Inventory adjustment (manual correction)
   */
  ADJUSTMENT = 'adjustment',
  
  /**
   * Inventory transferred between locations
   */
  TRANSFER = 'transfer',
  
  /**
   * Inventory reserved for future use
   */
  RESERVATION = 'reservation',
  
  /**
   * Cancellation of a previous reservation
   */
  RESERVATION_CANCELLATION = 'reservation_cancellation',
  
  /**
   * Inventory consumed in production
   */
  PRODUCTION_CONSUMPTION = 'production_consumption',
  
  /**
   * Inventory produced from manufacturing
   */
  PRODUCTION_OUTPUT = 'production_output',
  
  /**
   * Inventory written off (damaged, expired, etc.)
   */
  WRITE_OFF = 'write_off',
  
  /**
   * Initial inventory setup
   */
  INITIAL_SETUP = 'initial_setup',
  
  /**
   * Inventory count adjustment after physical count
   */
  PHYSICAL_COUNT = 'physical_count'
}
