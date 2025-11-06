import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';

@Injectable()
// Inherit from the 'jwt' strategy defined in jwt.strategy.ts
export class JwtAuthGuard extends AuthGuard('jwt') {
    
    // Override getRequest to handle both HTTP (REST) and GraphQL contexts
    getRequest(context: ExecutionContext) {
        const type = context.getType() as string;

        if (type === 'http') {
            // For REST Controllers
            return context.switchToHttp().getRequest();
        } else if (type === 'graphql') {
            // For GraphQL Resolvers
            const ctx = GqlExecutionContext.create(context);
            // In GraphQL, the request object is inside the context object passed by Apollo
            return ctx.getContext().req;
        }
        return null;
    }

    // Optional: You can customize the response if authentication fails
    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            // Throw a custom exception that can be caught by the global exception filter
            throw err || new UnauthorizedException('Invalid or missing authentication token.');
        }
        return user;
    }
}