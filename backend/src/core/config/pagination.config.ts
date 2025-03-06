import { registerAs } from '@nestjs/config';

export default registerAs('pagination', () => ({
  defaultPageSize: 10,
  maxPageSize: 100,
  defaultCurrent: 1,
}));