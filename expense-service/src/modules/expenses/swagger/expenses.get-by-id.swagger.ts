import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrorResponses, ApiUuidParam } from '../../../common/swagger';
import { expenseResponseSchema } from './expenses.schemas';

export function GetExpenseByIdApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar despesa por ID',
      description:
        'Retorna os detalhes de uma despesa. ' +
        'Retorna 404 se a despesa não existir ou não pertencer ao usuário autenticado.',
    }),
    ApiUuidParam('id', 'Identificador único da despesa.'),
    ApiOkResponse({
      description: 'Despesa encontrada.',
      schema: expenseResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeUnauthorized: true,
      includeNotFound: true,
      includeInternalServerError: true,
    }),
  );
}
