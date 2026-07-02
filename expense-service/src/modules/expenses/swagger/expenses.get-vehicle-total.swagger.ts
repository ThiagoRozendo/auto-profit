import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrorResponses, ApiUuidParam } from '../../../common/swagger';
import { expenseVehicleTotalResponseSchema } from './expenses.schemas';

export function GetVehicleExpensesTotalApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Total de despesas por veículo',
      description:
        'Retorna o somatório e a quantidade de despesas do usuário autenticado para um veículo específico. ' +
        'Este endpoint é utilizado pelo Pricing Service para cálculo de custo total.',
    }),
    ApiUuidParam('vehicleId', 'UUID do veículo.'),
    ApiOkResponse({
      description: 'Total de despesas calculado com sucesso.',
      schema: expenseVehicleTotalResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeUnauthorized: true,
      includeInternalServerError: true,
    }),
  );
}
