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
    example: '11111111-1111-1111-1111-111111111111',
  },
};

export function ExpensesApiTags(): ClassDecorator {
  return applyDecorators(
    ApiTags('Expenses'),
    ApiHeader(X_USER_ID_HEADER),
  ) as ClassDecorator;
}
