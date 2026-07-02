import { applyDecorators } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses, ApiUuidParam } from '../../../common/swagger';
import { pricingPreviewResponseSchema } from './pricing.schemas';

export function PreviewPricingByVehicleApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Pré-visualizar preço por veículo',
      description:
        'Calcula o preço sugerido para um veículo usando dados do Vehicle Service e do Expense Service, sem salvar histórico.',
    }),
    ApiHeader({
      name: 'x-user-id',
      required: true,
      description:
        'UUID do usuário autenticado. Em produção será enviado pelo API Gateway.',
      example: '11111111-1111-4111-8111-111111111111',
    }),
    ApiUuidParam('vehicleId', 'Identificador do veículo.'),
    ApiQuery({
      name: 'margin',
      required: false,
      type: Number,
      description:
        'Margem de lucro desejada. Se omitida, usa a margem padrão do usuário.',
      example: 20,
    }),
    ApiOkResponse({
      description: 'Preço sugerido calculado com sucesso.',
      schema: pricingPreviewResponseSchema,
    }),
    ApiServiceUnavailableResponse({
      description: 'Vehicle Service ou Expense Service indisponível.',
    }),
    ApiCommonErrorResponses({
      includeBadRequest: true,
      includeUnauthorized: true,
      includeNotFound: true,
      includeInternalServerError: true,
    }),
  );
}
