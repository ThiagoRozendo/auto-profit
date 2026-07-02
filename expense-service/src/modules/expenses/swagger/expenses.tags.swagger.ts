import { applyDecorators } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

const X_USER_ID_HEADER = {
  name: 'x-user-id',
  required: true,
  description:
    'UUID do usuário autenticado. Em produção será enviado pelo API Gateway. ' +
    'Para testes diretos, informar manualmente.',
  schema: {
    type: 'string',
    format: 'uuid',
    example: '11111111-1111-4111-8111-111111111111',
  },
};

const X_USER_EMAIL_HEADER = {
  name: 'x-user-email',
  required: false,
  description: 'E-mail do usuário autenticado. Enviado automaticamente pelo API Gateway.',
  schema: { type: 'string', format: 'email', example: 'joao.silva@example.com' },
};

const X_USER_ROLE_HEADER = {
  name: 'x-user-role',
  required: false,
  description: 'Papel (role) do usuário autenticado. Enviado automaticamente pelo API Gateway.',
  schema: { type: 'string', enum: ['ADMIN', 'MANAGER', 'SELLER'], example: 'SELLER' },
};

export function ExpensesApiTags(): ClassDecorator {
  return applyDecorators(
    ApiTags('Expenses'),
    ApiHeader(X_USER_ID_HEADER),
    ApiHeader(X_USER_EMAIL_HEADER),
    ApiHeader(X_USER_ROLE_HEADER),
  );
}
