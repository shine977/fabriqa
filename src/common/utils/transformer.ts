import * as dayjs from 'dayjs';
import { ValueTransformer } from 'typeorm';

export const UUIDTransformer: ValueTransformer = {
  to: (val: string) => (val != null ? val.replace(/-/g, '') : val),
  from: (val: string) => (val != null ? val.replace(/-/g, '') : val),
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
    return date
  }
  from(date: Date) {
    return dayjs(date).format('YYYY-MM-DD')
  }

}