import { Injectable, Logger } from '@nestjs/common';
import { ExcelParser } from '../interfaces/excel-parser.interface';
import { CreateOrderDto } from '@modules/orders/dto/create-order.dto';

@Injectable()
export class ExcelImportService {
  private readonly logger = new Logger(ExcelImportService.name);
  private readonly parsers: Map<string, ExcelParser> = new Map();

  registerParser(parser: ExcelParser) {
    this.logger.log(`Registering Excel parser: ${parser.name}`);
    this.parsers.set(parser.name, parser);
  }

  async importExcel(file: Express.Multer.File): Promise<CreateOrderDto[]> {
    // 找到合适的解析器
    const parser = await this.findSuitableParser(file);
    if (!parser) {
      throw new Error('No suitable parser found for this Excel format');
    }

    // 解析 Excel
    const result = await parser.parse(file);

    // 转换为订单数据
    return parser.transform(result);
  }

  private async findSuitableParser(file: Express.Multer.File): Promise<ExcelParser | null> {
    for (const parser of this.parsers.values()) {
      try {
        if (await parser.canHandle(file)) {
          return parser;
        }
      } catch (error) {
        this.logger.warn(`Parser ${parser.name} failed to check file: ${error.message}`);
      }
    }
    return null;
  }
}
