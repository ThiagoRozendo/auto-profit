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
  expensesListResponseSchema,
  serviceUnavailableResponseSchema,
} from './expenses.schemas';

export function ListExpensesByVehicleApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Listar despesas por veículo',
      description:
        'Encaminha a busca de despesas de um veículo específico para o Expense Service.',
    }),
    ApiUuidParam('vehicleId', 'Identificador do veículo.'),
    ApiOkResponse({
      description: 'Lista de despesas do veículo retornada com sucesso.',
      schema: expensesListResponseSchema,
    }),
    ApiServiceUnavailableResponse({
      description: 'Expense Service indisponível.',
      schema: serviceUnavailableResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeUnauthorized: true,
    }),
  );
}
