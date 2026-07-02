import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

export interface InternalUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Extrai o usuário autenticado dos headers internos repassados pelo API Gateway.
 *
 * Headers esperados:
 *   x-user-id    → UUID do usuário autenticado
 *   x-user-email → e-mail do usuário autenticado
 *   x-user-role  → papel (role) do usuário autenticado
 *
 * O Gateway validará o Bearer Token JWT e injetará esses headers antes de
 * encaminhar a requisição para este serviço.
 * Para testes diretos, enviar o header x-user-id manualmente.
 */
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
