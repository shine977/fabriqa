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
