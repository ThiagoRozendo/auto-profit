import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrorResponses, ApiUuidParam } from '../../../common/swagger';
import { expenseResponseSchema, updateExpenseRequestSchema } from './expenses.schemas';

export function UpdateExpenseApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar despesa',
      description:
        'Atualiza campos da despesa. Só permite atualizar despesas do usuário autenticado. ' +
        'Todos os campos são opcionais — apenas os enviados serão atualizados.',
    }),
    ApiUuidParam('id', 'Identificador único da despesa.'),
    ApiBody({
      required: true,
      schema: updateExpenseRequestSchema,
    }),
    ApiOkResponse({
      description: 'Despesa atualizada com sucesso.',
      schema: expenseResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: true,
      includeUnauthorized: true,
      includeNotFound: true,
      includeInternalServerError: true,
    }),
  );
}
