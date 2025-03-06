import { CreateOrderDto } from '@modules/orders/dto/create-order.dto';
import { multiply, round } from 'mathjs';
import { ExcelOrderItem, ExcelParseOrder } from 'src/plugins/order/interfaces/excel-parser.interface';
import * as XLSX from 'xlsx';

interface OrderItem {
  taskOrderNo?: string;
  quantity: number;
  amount: number;
  unitPrice: number;
  specification: string;
  name: string;
  materialNo: string;
  materialCode: string;
  delivery: string;
  orderId?: number;
}

interface Order {
  orderNo: string;
  orderDate: string;
  items: OrderItem[];
  paymentTerm: string;
  taskOrderNo: string;
  delivery: string;
  customer: string;
}

export function cleanAndExtractData(fileBuffer: Buffer, range = { s: { c: 0, r: 0 }, e: { c: 10, r: 20 } }) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  sheet['!ref'] = XLSX.utils.encode_range(range);
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, dateNF: 'YYYY-MM-DD' });
  // 假设 data 是一个数组的数组（每个子数组代表一行）

  const cleanedData = data.map((row: any[]) => {
    return row.map(cell => (typeof cell === 'string' ? cell.trim().replace(/\s+/g, ' ').replace(/：/g, ':') : cell));
  });

  return cleanedData;
}

export function splitColon(str: string) {
  const strArr = str.split(':');
  return strArr[strArr.length - 1];
}

export function calculateOrderData(data): CreateOrderDto {
  let orderNo: string,
    orderDate: string,
    paymentTerm: string,
    delivery: string,
    taskOrderNo: string,
    customer: string,
    deliveryAddress: string,
    currency: string,
    remarks: string[];
  const items = data.reduce((memo: ExcelOrderItem[], next: string[], index) => {
    if (index == 1 && next[0]) {
      customer = next[0];
    } else if (index == 4 && next[0]) {
      console.log(next[0]);
      const str = splitColon(next[0]);
      if (/[0-9]/.test(str)) {
        orderNo = str;
      }
      orderDate = splitColon(next[next.length - 1]);
    } else if (index == 5) {
      paymentTerm = splitColon(next[next.length - 1]);
      deliveryAddress = next[0];
    } else if (next[3] && !/[\u4e00-\u9fff]/.test(next[1])) {
      if (orderNo == null) {
        orderNo = next[1];
      }
      if (next[8]) {
        delivery = next[8];
      }
      if (!taskOrderNo) {
        taskOrderNo = next[2];
      }
      memo.push({
        taskOrderNo: next[2] || taskOrderNo,
        materialCode: next[3],
        materialName: next[4],
        specification: next[6],
        delivery: next[8] || delivery,
        quantity: +next[7] || 0,
        unitPrice: +next[9] || 0,
        amount: round(multiply(+next[7] || 0, +next[9] || 0), 3),
        unit: 'PCS',
        orderNo,
        remarks: '',
      });
    }
    return memo;
  }, []);
  return {
    orderNo,
    orderDate,
    items,
    paymentTerm,
    taskOrderNo,
    delivery,
    deliveryAddress,
  };
}
