import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';
import {
  ApiCommonErrorResponses,
  ApiUuidParam,
} from '../../../common/swagger';

export function DeleteVehicleApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Excluir veículo',
      description:
        'Exclui um veículo pertencente ao usuário autenticado.',
    }),
    ApiUuidParam('id', 'Identificador do veículo.'),
    ApiNoContentResponse({
      description: 'Veículo excluído com sucesso.',
    }),
    ApiCommonErrorResponses({
      includeBadRequest: false,
      includeUnauthorized: true,
      includeNotFound: true,
    }),
  );
}
