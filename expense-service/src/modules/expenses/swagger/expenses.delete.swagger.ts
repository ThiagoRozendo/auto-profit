import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrorResponses, ApiUuidParam } from '../../../common/swagger';

export function DeleteExpenseApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Excluir despesa',
      description:
        'Remove uma despesa. Só permite excluir despesas pertencentes ao usuário autenticado. ' +
        'Retorna 204 em caso de sucesso.',
    }),
    ApiUuidParam('id', 'Identificador único da despesa.'),
    ApiNoContentResponse({
      description: 'Despesa excluída com sucesso.',
    }),
    ApiCommonErrorResponses({
      includeUnauthorized: true,
      includeNotFound: true,
      includeInternalServerError: true,
    }),
  );
}
