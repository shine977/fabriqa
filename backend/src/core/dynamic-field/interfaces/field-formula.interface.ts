// src/core/dynamic-field/interfaces/field-formula.interface.ts

/**
 * Formula operator types for field calculations
 */
export enum FormulaOperator {
  ADD = '+',
  SUBTRACT = '-',
  MULTIPLY = '*',
  DIVIDE = '/',
  MODULO = '%',
  POWER = '^',
  CONCAT = '&',
}

/**
 * Formula function types
 */
export enum FormulaFunction {
  SUM = 'SUM',
  AVG = 'AVG',
  MIN = 'MIN',
  MAX = 'MAX',
  COUNT = 'COUNT',
  ROUND = 'ROUND',
  IF = 'IF',
  CONCAT = 'CONCAT',
  DATE = 'DATE',
  NOW = 'NOW',
}

/**
 * Formula expression types
 */
export enum ExpressionType {
  LITERAL = 'literal',
  FIELD_REFERENCE = 'field_reference',
  OPERATOR = 'operator',
  FUNCTION = 'function',
}

/**
 * Formula expression node interface
 */
export interface ExpressionNode {
  type: ExpressionType;
  value: string | number | boolean;
  children?: ExpressionNode[];
  metadata?: Record<string, any>;
}

/**
 * Field formula interface
 */
export interface FieldFormula {
  id: string;
  name: string;
  description?: string;
  targetFieldId: string;
  expression: string;
  parsedExpression: ExpressionNode;
  dependencies: string[];
  isEnabled: boolean;
  metadata?: Record<string, any>;
}
