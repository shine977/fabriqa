import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { BaseExcelParser } from './base-excel-parser';
import { ExcelParseResult, ExcelOrderHeader, ExcelOrderItem } from '../interfaces/excel-parser.interface';
import { FactoryEntity } from '@modules/factories/entities/factory.entity';
import { SupplierEntity } from '@modules/suppliers/entities/supplier.entity';
import { ORDER_DIRECTION, MATERIAL_TYPE } from '@shared/constants/order.constants';
import { CreateOrderDto } from '@modules/orders/dto/create-order.dto';
import { calculateOrderData, cleanAndExtractData } from '@shared/utils/xlsx';

@Injectable()
export class DefaultExcelParser extends BaseExcelParser {
  readonly name = 'default';

  constructor(
    @InjectRepository(FactoryEntity)
    private readonly factoryRepo: Repository<FactoryEntity>,
    @InjectRepository(SupplierEntity)
    private readonly supplierRepo: Repository<SupplierEntity>,
  ) {
    super();
  }

  async canHandle(file: Express.Multer.File): Promise<boolean> {
    try {
      const rows = this.parseFile(file);
      // 检查是否符合默认模板的特征
      return rows.orderNo !== undefined;
    } catch {
      return false;
    }
  }
  protected parseFile(file: Express.Multer.File) {
    return calculateOrderData(cleanAndExtractData(file.buffer));
  }
  async parse(file: Express.Multer.File): Promise<ExcelParseResult> {
    const createOrderDto = this.parseFile(file);

    // 构造符合 ExcelOrderHeader 接口的对象
    const header: ExcelOrderHeader = {
      orderNo: createOrderDto.orderNo || '',
      orderDate: createOrderDto.orderDate || '',
      deliveryAddress: createOrderDto.deliveryAddress || '',
      delivery: createOrderDto.delivery || '',
      paymentTerm: createOrderDto.paymentTerm || '',
      supplierName: createOrderDto.supplierId || '',
      taxRate: createOrderDto.taxRate || 0,
      currency: 'CNY', // 默认使用人民币
      remarks: createOrderDto.paymentClause ? [createOrderDto.paymentClause] : [],
      customer: createOrderDto.customerId || '',
    };

    // 将 CreateOrderItemDto[] 转换为 ExcelOrderItem[]
    const items: ExcelOrderItem[] =
      createOrderDto.items?.map(item => ({
        orderNo: createOrderDto.orderNo || '',
        taskOrderNo: '', // 默认空字符串
        materialCode: item.materialNo || '',
        materialName: item.name || '',
        specification: item.specification || '',
        quantity: item.quantity || 0,
        delivery: item.delivery ? dayjs(item.delivery).format('YYYY-MM-DD') : '',
        unitPrice: item.unitPrice || 0,
        amount: item.quantity * item.unitPrice,
        unit: item.unit || 'PCS',
        remarks: '',
      })) || [];

    return {
      header,
      items,
    };
  }

  private isValidItem(item: ExcelOrderItem): boolean {
    return (
      (!!item.materialCode || !!item.materialName) && // Must have either code or name
      item.quantity > 0 && // Must have positive quantity
      item.unitPrice >= 0 // Unit price cannot be negative
    );
  }

  private parseNumber(value: any): number {
    if (!value) return 0;
    const num = Number(String(value).replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  private excelDateToString(excelDate: number): string {
    try {
      if (!excelDate) return '';
      // Excel dates are counted from 1900-01-01
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return dayjs(date).format('YYYY-MM-DD');
    } catch (error) {
      this.logger.warn(`Invalid Excel date value: ${excelDate}`);
      return '';
    }
  }

  async transform(result: ExcelParseResult): Promise<CreateOrderDto[]> {
    const { header, items } = result;

    // Group items by order number
    const orderGroups = new Map<string, ExcelOrderItem[]>();
    items.forEach(item => {
      const orderNo = item.orderNo || 'default';
      if (!orderGroups.has(orderNo)) {
        orderGroups.set(orderNo, []);
      }
      orderGroups.get(orderNo)?.push(item);
    });

    // Transform to orders
    const orders: CreateOrderDto[] = [];
    for (const [orderNo, orderItems] of orderGroups) {
      if (!orderItems.length) continue;

      const order: CreateOrderDto = {
        orderNo: orderNo === 'default' ? '' : orderNo,
        direction: ORDER_DIRECTION.INBOUND,
        orderDate: header.orderDate || dayjs().format('YYYY-MM-DD'),
        paymentTerm: header.paymentTerm,
        paymentClause: header.remarks.join('\n'),
        delivery: orderItems[0].delivery || null,
        taxRate: header.taxRate,
        items: orderItems.map(item => ({
          materialNo: item.materialCode,
          materialCode: item.materialCode,
          name: item.materialName,
          material: MATERIAL_TYPE.RAW,
          specification: item.specification,
          unit: item.unit || 'PCS',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          delivery: item.delivery ? new Date(item.delivery) : new Date(),
          dynamicFields: {
            amount: item.amount,
            remarks: item.remarks,
          },
        })),
      };

      orders.push(order);
    }

    return orders;
  }
}
