import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { UserPayload } from './jwt.strategy';

export const CurrentUser = createParamDecorator(
  (_: never, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { user: UserPayload }>();

    return request.user;
  },
);
