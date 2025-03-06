// src/modules/orders/interfaces/order.interface.ts
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { FieldTemplateEntity } from '@core/dynamic-field/entities/field-template.entity';

export interface OrderWithTemplate {
  order: OrderEntity;
  template: FieldTemplateEntity;
  items: Array<{
    item: OrderItemEntity;
    template: FieldTemplateEntity;
  }>;
}

export interface OrderQueryOptions {
  includeDynamicFields?: boolean;
  includeItems?: boolean;
  includeTemplate?: boolean;
}
export interface OrderValidationContext {
  tenantId: string;
}

export interface OrderDynamicFieldsConfig {
  orderTemplate: FieldTemplateEntity;
  itemTemplate: FieldTemplateEntity;
  validationContext: OrderValidationContext;
}
