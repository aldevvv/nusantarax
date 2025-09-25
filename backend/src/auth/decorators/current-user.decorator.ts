import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../types/auth.types';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): AuthenticatedUser | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    // If a specific field is requested, return that field
    if (data && user && typeof user === 'object') {
      return user[data];
    }
    
    // Otherwise return the full user object
    return user;
  },
);