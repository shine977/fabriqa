import { CreateOrderDto } from '@modules/orders/dto/create-order.dto';

export interface ExcelOrderHeader {
  orderNo: string;
  orderDate: string;
  deliveryAddress: string;
  delivery: string;
  paymentTerm: string;
  supplierName?: string;
  taxRate?: number;
  currency: string;
  remarks: string[];
  customer?: string;
}

export interface ExcelOrderItem {
  orderNo: string;
  taskOrderNo: string;
  materialCode: string;
  materialName: string;
  specification: string;
  quantity: number;
  delivery: string;
  unitPrice: number;
  amount: number;
  unit: string;
  remarks: string;
}

export interface ExcelParseOrder extends ExcelOrderHeader {
  items: ExcelOrderItem[];
  taskOrderNo: string;
}

export interface ExcelParseResult {
  header: ExcelOrderHeader;
  items: ExcelOrderItem[];
}

export interface ExcelParser {
  readonly name: string;

  // Can handle the type of Excel
  canHandle(file: Express.Multer.File): Promise<boolean>;

  // Parse Excel file
  parse(file: Express.Multer.File): Promise<ExcelParseResult>;

  // Transform Excel parse result to order data
  transform(result: ExcelParseResult): Promise<CreateOrderDto[]>;
}
