import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
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
} from './expenses.schemas';

export function GetExpenseByIdApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Buscar despesa por ID',
      description:
        'Encaminha a busca de uma despesa específica para o Expense Service.',
    }),
    ApiUuidParam('id', 'Identificador da despesa.'),
    ApiOkResponse({
      description: 'Despesa encontrada com sucesso.',
      schema: expenseResponseSchema,
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
