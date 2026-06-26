import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '../auth/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload | undefined => {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    return request.user;
  },
);
