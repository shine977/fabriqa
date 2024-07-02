import { multiply, round } from 'mathjs';
import * as XLSX from 'xlsx';

interface OrderItem {
    taskOrderNo?: string
    quantity: number
    amount: number,
    unitPrice: number,
    specification: string,
    name: string,
    materialNo: string,
    materialCode: string,
    delivery: string
    orderId?: number
}

interface Order {
    orderNumber: string,
    purchaseDate: string,
    items: OrderItem[],
    paymentClause: string,
    taskOrderNo: string
    delivery: string,
    customer: string
}


export function cleanAndExtractData(fileBuffer: Buffer, range = { s: { c: 0, r: 0 }, e: { c: 10, r: 20 } }) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    sheet['!ref'] = XLSX.utils.encode_range(range);
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });
    // 假设 data 是一个数组的数组（每个子数组代表一行）

    const cleanedData = data.map((row: any[]) => {
        return row.map(cell =>
            typeof cell === 'string' ? cell.trim().replace(/\s+/g, ' ').replace(/：/g, ':') : cell
        )
    });

    return cleanedData;
}

export function splitColon(str: string) {
    const strArr = str.split(':')
    return strArr[strArr.length - 1]
}

export function calculateOrderData(data): Order {
    let orderNumber: string, purchaseDate: string, paymentClause: string, delivery: string, taskOrderNo: string, customer: string
    const items = data.reduce((memo: OrderItem[], next: string[], index) => {
        if (index == 1 && next[0]) {
            customer = next[0]
        } else if (index == 4 && next[0]) {
            console.log(next[0])
            const str = splitColon(next[0])
            if (/[0-9]/.test(str)) {
                orderNumber = str
            }
            purchaseDate = splitColon(next[next.length - 1])

        } else if (index == 5) {
            paymentClause = splitColon(next[next.length - 1])
        } else if (next[3] && !/[\u4e00-\u9fff]/.test(next[1])) {
            if (orderNumber == null) {
                orderNumber = next[1]
            }
            if (next[8]) {
                delivery = next[8]
            }
            if (!taskOrderNo) {
                taskOrderNo = next[2]
            }
            memo.push({
                taskOrderNo: next[2] || taskOrderNo,
                materialNo: next[3],
                materialCode: next[4],
                name: next[5],
                specification: next[6],
                delivery: next[8] || delivery,
                quantity: +next[7] || 0,
                unitPrice: +next[9] || 0,
                amount: round(multiply(+next[7] || 0, +next[9] || 0), 3),
            })
        }
        return memo
    }, [] as OrderItem[])
    return {
        orderNumber,
        purchaseDate,
        items,
        paymentClause,
        taskOrderNo,
        delivery,
        customer
    } as Order
}