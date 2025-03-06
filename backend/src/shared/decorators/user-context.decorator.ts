// src/core/decorators/inject-context.decorator.ts
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserContext } from 'src/core/context';

export const InjectContext = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const context = UserContext.getContext();
  if (!context) {
    throw new UnauthorizedException('User context not found');
  }
  return context;
});

// 用于注入当前用户
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const context = UserContext.getContext();
  if (!context || !context.getUser()) {
    throw new UnauthorizedException('User not found in context');
  }
  return context.getUser();
});
