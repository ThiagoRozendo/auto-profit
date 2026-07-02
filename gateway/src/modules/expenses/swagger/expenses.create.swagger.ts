import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../../common/swagger';
import {
  createExpenseRequestSchema,
  expenseResponseSchema,
  serviceUnavailableResponseSchema,
} from './expenses.schemas';

export function CreateExpenseApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Cadastrar despesa',
      description:
        'Encaminha o cadastro de uma despesa para o Expense Service e retorna o recurso criado.',
    }),
    ApiBody({
      required: true,
      schema: createExpenseRequestSchema,
    }),
    ApiCreatedResponse({
      description: 'Despesa criada com sucesso.',
      schema: expenseResponseSchema,
    }),
    ApiServiceUnavailableResponse({
      description: 'Expense Service indisponível.',
      schema: serviceUnavailableResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: true,
      includeUnauthorized: true,
    }),
  );
}
