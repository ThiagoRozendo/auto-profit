import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../../common/swagger';
import {
  calculatePricingRequestSchema,
  pricingPreviewResponseSchema,
} from './pricing.schemas';

export function CalculatePricingApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Calcular preço sugerido',
      description:
        'Calcula o preço sugerido e salva o histórico quando saveHistory for true ou omitido.',
    }),
    ApiHeader({
      name: 'x-user-id',
      required: true,
      description:
        'UUID do usuário autenticado. Em produção será enviado pelo API Gateway.',
      example: '11111111-1111-4111-8111-111111111111',
    }),
    ApiBody({ schema: calculatePricingRequestSchema }),
    ApiCreatedResponse({
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
