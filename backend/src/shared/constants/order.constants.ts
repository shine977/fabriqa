export enum ORDER_TYPE {
  PROCESSING = 'processing', // Processing order
  ASSEMBLY = 'assembly', // Assembly order
}

export enum ORDER_STATUS {
  DRAFT = 'draft', // Initial state
  CONFIRMED = 'confirmed', // Order confirmed
  PENDING = 'pending', // Order pending
  PROCESSING = 'processing', // In production
  DELIVERED = 'delivered', // Delivered to factory
  COMPLETED = 'completed', // Order completed
  CANCELLED = 'cancelled', // Order cancelled
}

export enum MATERIAL_TYPE {
  PLASTIC = 'plastic',
  RUBBER = 'rubber',
  METAL = 'metal',
  RAW = 'raw',
  OTHER = 'other',
}

export enum ORDER_DIRECTION {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}
