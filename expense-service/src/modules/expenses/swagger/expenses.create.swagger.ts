import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../../common/swagger';
import { createExpenseRequestSchema, expenseResponseSchema } from './expenses.schemas';

export function CreateExpenseApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastrar despesa',
      description:
        'Cria uma nova despesa associada ao usuário autenticado e ao veículo informado. ' +
        'O campo expenseDate usa a data atual se não informado.',
    }),
    ApiBody({
      required: true,
      schema: createExpenseRequestSchema,
    }),
    ApiCreatedResponse({
      description: 'Despesa criada com sucesso.',
      schema: expenseResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: true,
      includeUnauthorized: true,
      includeInternalServerError: true,
    }),
  );
}
