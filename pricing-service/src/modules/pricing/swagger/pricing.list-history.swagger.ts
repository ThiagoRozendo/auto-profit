import { applyDecorators } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../../common/swagger';
import { pricingHistoryListResponseSchema } from './pricing.schemas';

export function ListPricingHistoryApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar histórico de cálculos',
      description:
        'Retorna apenas os cálculos de precificação do usuário autenticado, ordenados por data de criação decrescente.',
    }),
    ApiHeader({
      name: 'x-user-id',
      required: true,
      description:
        'UUID do usuário autenticado. Em produção será enviado pelo API Gateway.',
      example: '11111111-1111-4111-8111-111111111111',
    }),
    ApiOkResponse({
      description: 'Histórico retornado com sucesso.',
      schema: pricingHistoryListResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: false,
      includeUnauthorized: true,
      includeInternalServerError: true,
    }),
  );
}
