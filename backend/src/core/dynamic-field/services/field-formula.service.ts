// src/core/dynamic-field/services/field-formula.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldFormulaEntity } from '../entities/field-formula.entity';
import {
  FieldFormula,
  ExpressionNode,
  ExpressionType,
  FormulaOperator,
  FormulaFunction,
} from '../interfaces/field-formula.interface';
import { FieldContext } from '../interfaces/field.interface';

@Injectable()
export class FieldFormulaService {
  private readonly logger = new Logger(FieldFormulaService.name);

  constructor(
    @InjectRepository(FieldFormulaEntity)
    private formulaRepo: Repository<FieldFormulaEntity>,
  ) {}

  /**
   * Create a new field formula
   */
  async createFormula(context: FieldContext, formula: Omit<FieldFormula, 'id'>): Promise<FieldFormulaEntity> {
    const parsedExpression = this.parseExpression(formula.expression);
    const dependencies = this.extractDependencies(parsedExpression);

    return this.formulaRepo.save({
      ...formula,
      parsedExpression,
      dependencies,
      tenantId: context.tenantId,
      moduleId: context.moduleId,
    });
  }

  /**
   * Get formulas for a specific field
   */
  async getFieldFormulas(context: FieldContext, fieldId: string): Promise<FieldFormulaEntity[]> {
    return this.formulaRepo.find({
      where: {
        tenantId: context.tenantId,
        moduleId: context.moduleId,
        targetFieldId: fieldId,
        isEnabled: true,
      },
    });
  }

  /**
   * Calculate formula results
   */
  async calculateFormulas(context: FieldContext, fieldValues: Record<string, any>): Promise<Record<string, any>> {
    const result: Record<string, any> = { ...fieldValues };

    const formulas = await this.formulaRepo.find({
      where: {
        tenantId: context.tenantId,
        moduleId: context.moduleId,
        isEnabled: true,
      },
    });

    // Sort formulas based on dependencies
    const sortedFormulas = this.sortFormulasByDependencies(formulas);

    // Calculate each formula
    for (const formula of sortedFormulas) {
      try {
        result[formula.targetFieldId] = this.evaluateExpression(formula.parsedExpression, result);
      } catch (error) {
        this.logger.error(`Error calculating formula ${formula.id}: ${error.message}`, error.stack);
      }
    }

    return result;
  }

  /**
   * Parse formula expression into AST
   */
  private parseExpression(expression: string): ExpressionNode {
    // Implement expression parsing logic
    // This should convert the string expression into an AST
    // For example: "SUM({field1}, {field2})" ->
    // {
    //   type: 'function',
    //   value: 'SUM',
    //   children: [
    //     { type: 'field_reference', value: 'field1' },
    //     { type: 'field_reference', value: 'field2' }
    //   ]
    // }
    return {} as ExpressionNode; // Placeholder
  }

  /**
   * Extract field dependencies from parsed expression
   */
  private extractDependencies(expression: ExpressionNode): string[] {
    const dependencies: Set<string> = new Set();

    const traverse = (node: ExpressionNode) => {
      if (node.type === ExpressionType.FIELD_REFERENCE) {
        dependencies.add(node.value as string);
      }
      node.children?.forEach(traverse);
    };

    traverse(expression);
    return Array.from(dependencies);
  }

  /**
   * Sort formulas based on their dependencies
   */
  private sortFormulasByDependencies(formulas: FieldFormulaEntity[]): FieldFormulaEntity[] {
    const graph = new Map<string, Set<string>>();

    // Build dependency graph
    formulas.forEach(formula => {
      graph.set(formula.targetFieldId, new Set(formula.dependencies));
    });

    // Topological sort
    const sorted: FieldFormulaEntity[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();

    const visit = (formulaId: string) => {
      if (temp.has(formulaId)) {
        throw new Error('Circular dependency detected');
      }
      if (visited.has(formulaId)) {
        return;
      }

      temp.add(formulaId);
      const dependencies = graph.get(formulaId) || new Set();
      dependencies.forEach(dep => visit(dep));
      temp.delete(formulaId);
      visited.add(formulaId);

      const formula = formulas.find(f => f.targetFieldId === formulaId);
      if (formula) {
        sorted.push(formula);
      }
    };

    formulas.forEach(formula => {
      if (!visited.has(formula.targetFieldId)) {
        visit(formula.targetFieldId);
      }
    });

    return sorted;
  }

  /**
   * Evaluate expression with given values
   */
  private evaluateExpression(expression: ExpressionNode, values: Record<string, any>): any {
    switch (expression.type) {
      case ExpressionType.LITERAL:
        return expression.value;

      case ExpressionType.FIELD_REFERENCE:
        return values[expression.value as string];

      case ExpressionType.OPERATOR:
        return this.evaluateOperator(expression.value as FormulaOperator, expression.children || [], values);

      case ExpressionType.FUNCTION:
        return this.evaluateFunction(expression.value as FormulaFunction, expression.children || [], values);

      default:
        throw new Error(`Unknown expression type: ${expression.type}`);
    }
  }

  /**
   * Evaluate operator expression
   */
  private evaluateOperator(operator: FormulaOperator, operands: ExpressionNode[], values: Record<string, any>): any {
    const evaluatedOperands = operands.map(op => this.evaluateExpression(op, values));

    switch (operator) {
      case FormulaOperator.ADD:
        return evaluatedOperands.reduce((a, b) => a + b);
      case FormulaOperator.SUBTRACT:
        return evaluatedOperands.reduce((a, b) => a - b);
      case FormulaOperator.MULTIPLY:
        return evaluatedOperands.reduce((a, b) => a * b);
      case FormulaOperator.DIVIDE:
        return evaluatedOperands.reduce((a, b) => a / b);
      case FormulaOperator.MODULO:
        return evaluatedOperands.reduce((a, b) => a % b);
      case FormulaOperator.POWER:
        return evaluatedOperands.reduce((a, b) => Math.pow(a, b));
      case FormulaOperator.CONCAT:
        return evaluatedOperands.join('');
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }

  /**
   * Evaluate function expression
   */
  private evaluateFunction(func: FormulaFunction, args: ExpressionNode[], values: Record<string, any>): any {
    const evaluatedArgs = args.map(arg => this.evaluateExpression(arg, values));

    switch (func) {
      case FormulaFunction.SUM:
        return evaluatedArgs.reduce((a, b) => a + b, 0);
      case FormulaFunction.AVG:
        return evaluatedArgs.reduce((a, b) => a + b, 0) / evaluatedArgs.length;
      case FormulaFunction.MIN:
        return Math.min(...evaluatedArgs);
      case FormulaFunction.MAX:
        return Math.max(...evaluatedArgs);
      case FormulaFunction.COUNT:
        return evaluatedArgs.length;
      case FormulaFunction.ROUND:
        return Math.round(evaluatedArgs[0]);
      case FormulaFunction.IF:
        return evaluatedArgs[0] ? evaluatedArgs[1] : evaluatedArgs[2];
      case FormulaFunction.CONCAT:
        return evaluatedArgs.join('');
      case FormulaFunction.DATE:
        // Ensure we have valid date parameters
        const [year, month, day, hours, minutes, seconds, ms] = evaluatedArgs.map(Number);
        return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, seconds || 0, ms || 0);
      case FormulaFunction.NOW:
        return new Date();
      default:
        throw new Error(`Unknown function: ${func}`);
    }
  }
}
