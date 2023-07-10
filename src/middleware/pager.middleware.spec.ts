import { PagerMiddleware } from './pager.middleware';

describe('PagerMiddleware', () => {
  it('should be defined', () => {
    expect(new PagerMiddleware()).toBeDefined();
  });
});
