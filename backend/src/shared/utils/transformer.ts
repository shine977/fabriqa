import * as dayjs from 'dayjs';
import { ValueTransformer } from 'typeorm';

export const UUIDTransformer = {
  to: (value: string | null): Buffer | null => {
    if (!value) return null;
    return Buffer.from(value.replace(/-/g, ''), 'hex');
  },
  from: (value: Buffer | null): string | null => {
    if (!value) return null;
    const hex = value.toString('hex');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  },
};

export class DecimalColumnTransformer {
  to(data: number): number {
    return data;
  }
  from(data: string): number {
    return parseFloat(data);
  }
}

export class DateTransformer {
  to(date: Date) {
    if (!date) return null;
    const parsedDate = dayjs(date);
    return parsedDate.isValid() ? parsedDate.format('YYYY-MM-DD') : null;
  }
  from(date: Date) {
    if (!date) return null;
    const parsedDate = dayjs(date);
    return parsedDate.isValid() ? parsedDate.format('YYYY-MM-DD') : null;
  }
}

export class BooleanTransformer {
  to(value: boolean): boolean {
    return value;
  }

  from(value: any): boolean {
    if (value === null || value === undefined) {
      return false;
    }
    return value === 't' ? true : value === 'f' ? false : Boolean(value);
  }
}
