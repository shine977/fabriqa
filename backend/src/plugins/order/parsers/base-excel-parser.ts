import { Logger } from '@nestjs/common';
import { read, utils } from 'xlsx';
import { ExcelParser, ExcelOrderHeader, ExcelOrderItem, ExcelParseResult } from '../interfaces/excel-parser.interface';
import { CreateOrderDto } from '@modules/orders/dto/create-order.dto';

export abstract class BaseExcelParser implements ExcelParser {
  protected readonly logger = new Logger(this.constructor.name);

  abstract readonly name: string;

  abstract canHandle(file: Express.Multer.File): Promise<boolean>;

  abstract parse(file: Express.Multer.File): Promise<ExcelParseResult>;

  abstract transform(result: ExcelParseResult): Promise<CreateOrderDto[]>;

  protected validateHeader(header: ExcelOrderHeader): void {
    // if (!header.factoryName) {
    //   throw new Error('Factory name is required');
    // }
    if (!header.supplierName) {
      throw new Error('Supplier name is required');
    }
    // Add more validation as needed
  }

  protected validateItems(items: ExcelOrderItem[]): void {
    if (!items.length) {
      throw new Error('No items found in Excel');
    }

    items.forEach((item, index) => {
      if (!item.materialName) {
        throw new Error(`Material name is required at row ${index + 1}`);
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Invalid quantity at row ${index + 1}`);
      }
      // Add more validation as needed
    });
  }

  protected parseExcelFile(file: Express.Multer.File): any[] {
    const workbook = read(file.buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return utils.sheet_to_json(sheet);
  }
}
