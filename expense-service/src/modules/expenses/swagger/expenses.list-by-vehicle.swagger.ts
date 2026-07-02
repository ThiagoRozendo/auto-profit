import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrorResponses, ApiUuidParam } from '../../../common/swagger';
import { expenseListResponseSchema } from './expenses.schemas';

export function ListExpensesByVehicleApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar despesas por veículo',
      description:
        'Retorna todas as despesas do usuário autenticado para um veículo específico. ' +
        'Ordenado por expenseDate e createdAt decrescente.',
    }),
    ApiUuidParam('vehicleId', 'UUID do veículo.'),
    ApiOkResponse({
      description: 'Lista de despesas do veículo.',
      schema: expenseListResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeUnauthorized: true,
      includeInternalServerError: true,
    }),
  );
}
