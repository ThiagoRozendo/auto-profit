import {
  UnauthorizedException,
  createParamDecorator,
  type ExecutionContext,
} from '@nestjs/common';
import { type Request } from 'express';

export interface InternalUser {
  id: string;
  email: string;
  role: string;
}

export const InternalUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): InternalUser => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const id = request.headers['x-user-id'];
    const email = request.headers['x-user-email'];
    const role = request.headers['x-user-role'];

    if (!id || typeof id !== 'string') {
      throw new UnauthorizedException('Usuário autenticado não informado');
    }

    return {
      id,
      email: typeof email === 'string' ? email : '',
      role: typeof role === 'string' ? role : '',
    };
  },
);
