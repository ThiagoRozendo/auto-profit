import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import {
  ApiCommonErrorResponses,
  ApiUuidParam,
} from '../../../common/swagger';
import { serviceUnavailableResponseSchema } from './vehicles.schemas';

export function DeleteVehicleApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Excluir veículo',
      description:
        'Encaminha a exclusão de um veículo para o Vehicle Service.',
    }),
    ApiUuidParam('id', 'Identificador do veículo.'),
    ApiNoContentResponse({
      description: 'Veículo excluído com sucesso.',
    }),
    ApiServiceUnavailableResponse({
      description: 'Vehicle Service indisponível.',
      schema: serviceUnavailableResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: false,
      includeUnauthorized: true,
      includeNotFound: true,
    }),
  );
}
