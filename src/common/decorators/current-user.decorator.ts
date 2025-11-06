import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    // For GraphQL context
    const gqlCtx = GqlExecutionContext.create(context);
    const request = gqlCtx.getContext().req;

    // Fallback for REST context
    const user = request?.user || context.switchToHttp().getRequest().user;

    return user;
  },
);
