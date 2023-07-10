import { ResponseMiddleware } from './response.middleware';

describe('ResponseMiddleware', () => {
  it('should be defined', () => {
    expect(new ResponseMiddleware()).toBeDefined();
  });
});
