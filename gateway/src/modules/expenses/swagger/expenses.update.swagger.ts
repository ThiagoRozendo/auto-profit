import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import {
  ApiCommonErrorResponses,
  ApiUuidParam,
} from '../../../common/swagger';
import {
  expenseResponseSchema,
  serviceUnavailableResponseSchema,
  updateExpenseRequestSchema,
} from './expenses.schemas';

export function UpdateExpenseApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Atualizar despesa',
      description:
        'Encaminha a atualização parcial de uma despesa para o Expense Service.',
    }),
    ApiUuidParam('id', 'Identificador da despesa.'),
    ApiBody({
      required: true,
      schema: updateExpenseRequestSchema,
    }),
    ApiOkResponse({
      description: 'Despesa atualizada com sucesso.',
      schema: expenseResponseSchema,
    }),
    ApiServiceUnavailableResponse({
      description: 'Expense Service indisponível.',
      schema: serviceUnavailableResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: true,
      includeUnauthorized: true,
      includeNotFound: true,
    }),
  );
}
