// src/core/dynamic-field/decorators/field-permission.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const FIELD_PERMISSION_KEY = 'field_permissions';
export const FieldPermission = (...permissions: string[]) => SetMetadata(FIELD_PERMISSION_KEY, permissions);
