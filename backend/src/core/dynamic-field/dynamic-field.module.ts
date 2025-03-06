// src/core/dynamic-field/dynamic-field.module.ts
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldDefinitionEntity } from './entities/field-definition.entity';
import { FieldValueEntity } from './entities/field-value.entity';
import { FieldTemplateEntity } from './entities/field-template.entity';
import { FieldDependencyEntity } from './entities/field-dependency.entity';
import { FieldFormulaEntity } from './entities/field-formula.entity';
import { FieldAuditLogEntity } from './entities/field-audit-log.entity';
import { CacheModule } from '@core/cache';
import { FieldService } from './services/field.service';
import { FieldFormulaService } from './services/field-formula.service';
import { FieldDependencyService } from './services/field-dependency.service';
import { FieldCacheService } from './services/field-cache.service';
import { FieldValidationService } from './services/field-validation.service';
import { FieldVersionService } from './services/field-version.service';
import { FieldTemplateService } from './services/field-template.service';
import { FieldValidator } from './validators/field.validator';
import { FieldAuditService } from './services/field-audit.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      FieldDefinitionEntity,
      FieldValueEntity,
      FieldTemplateEntity,
      FieldDependencyEntity,
      FieldFormulaEntity,
      FieldAuditLogEntity,
    ]),
    CacheModule.register({ max: 1000 }),
  ],
  providers: [
    FieldService,
    FieldCacheService,
    FieldFormulaService,
    FieldDependencyService,
    FieldValidationService,
    FieldVersionService,
    FieldTemplateService,
    FieldValidator,
    FieldAuditService,
  ],
  exports: [
    FieldService,
    FieldCacheService,
    FieldFormulaService,
    FieldDependencyService,
    FieldValidationService,
    FieldVersionService,
    FieldTemplateService,
  ],
})
export class DynamicFieldModule {}
