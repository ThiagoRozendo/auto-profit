import { applyDecorators } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrorResponses, ApiUuidParam } from '../../../common/swagger';
import { pricingHistoryListResponseSchema } from './pricing.schemas';

export function ListPricingHistoryByVehicleApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar histórico por veículo',
      description:
        'Retorna apenas os cálculos de precificação do usuário autenticado para o veículo informado.',
    }),
    ApiHeader({
      name: 'x-user-id',
      required: true,
      description:
        'UUID do usuário autenticado. Em produção será enviado pelo API Gateway.',
      example: '11111111-1111-4111-8111-111111111111',
    }),
    ApiUuidParam('vehicleId', 'Identificador do veículo.'),
    ApiOkResponse({
      description: 'Histórico por veículo retornado com sucesso.',
      schema: pricingHistoryListResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: false,
      includeUnauthorized: true,
      includeInternalServerError: true,
    }),
  );
}
