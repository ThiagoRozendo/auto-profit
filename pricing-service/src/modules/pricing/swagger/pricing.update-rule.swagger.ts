import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../../common/swagger';
import {
  pricingRuleResponseSchema,
  updatePricingRuleRequestSchema,
} from './pricing.schemas';

export function UpdatePricingRuleApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar regra de precificação',
      description: 'Atualiza a margem padrão de lucro do usuário autenticado.',
    }),
    ApiHeader({
      name: 'x-user-id',
      required: true,
      description:
        'UUID do usuário autenticado. Em produção será enviado pelo API Gateway.',
      example: '11111111-1111-4111-8111-111111111111',
    }),
    ApiBody({ schema: updatePricingRuleRequestSchema }),
    ApiOkResponse({
      description: 'Regra de precificação atualizada com sucesso.',
      schema: pricingRuleResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: true,
      includeUnauthorized: true,
      includeInternalServerError: true,
    }),
  );
}
