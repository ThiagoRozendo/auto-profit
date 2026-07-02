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
  expenseVehicleTotalResponseSchema,
  serviceUnavailableResponseSchema,
} from './expenses.schemas';

export function GetVehicleExpensesTotalApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Total de despesas por veículo',
      description:
        'Encaminha o cálculo de total de despesas de um veículo para o Expense Service.',
    }),
    ApiUuidParam('vehicleId', 'Identificador do veículo.'),
    ApiOkResponse({
      description: 'Total de despesas retornado com sucesso.',
      schema: expenseVehicleTotalResponseSchema,
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
