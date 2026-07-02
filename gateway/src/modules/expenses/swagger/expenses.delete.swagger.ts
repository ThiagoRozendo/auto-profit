import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import {
  ApiCommonErrorResponses,
  ApiUuidParam,
} from '../../../common/swagger';
import { serviceUnavailableResponseSchema } from './expenses.schemas';

export function DeleteExpenseApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Excluir despesa',
      description:
        'Encaminha a exclusão de uma despesa para o Expense Service.',
    }),
    ApiUuidParam('id', 'Identificador da despesa.'),
    ApiNoContentResponse({
      description: 'Despesa excluída com sucesso.',
    }),
    ApiServiceUnavailableResponse({
      description: 'Expense Service indisponível.',
      schema: serviceUnavailableResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeUnauthorized: true,
      includeNotFound: true,
    }),
  );
}
