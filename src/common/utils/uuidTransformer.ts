import { ValueTransformer } from 'typeorm';

export const UUIDTransformer: ValueTransformer = {
  to: (val: string) => (val != null ? val.replace(/-/g, '') : val),
  from: (val: string) => (val != null ? val.replace(/-/g, '') : val),
};
