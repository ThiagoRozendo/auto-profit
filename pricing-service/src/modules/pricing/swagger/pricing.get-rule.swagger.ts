import { applyDecorators } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../../common/swagger';
import { pricingRuleResponseSchema } from './pricing.schemas';

export function GetPricingRuleApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar regra de precificação',
      description:
        'Retorna a regra de precificação do usuário autenticado. Caso ainda não exista, cria a regra padrão com margem de 18%.',
    }),
    ApiHeader({
      name: 'x-user-id',
      required: true,
      description:
        'UUID do usuário autenticado. Em produção será enviado pelo API Gateway.',
      example: '11111111-1111-4111-8111-111111111111',
    }),
    ApiOkResponse({
      description: 'Regra de precificação retornada com sucesso.',
      schema: pricingRuleResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: false,
      includeUnauthorized: true,
      includeInternalServerError: true,
    }),
  );
}
