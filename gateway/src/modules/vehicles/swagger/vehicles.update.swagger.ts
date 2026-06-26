import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import {
  ApiCommonErrorResponses,
  ApiUuidParam,
} from '../../../common/swagger';
import {
  serviceUnavailableResponseSchema,
  updateVehicleRequestSchema,
  vehicleResponseSchema,
} from './vehicles.schemas';

export function UpdateVehicleApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Atualizar veículo',
      description:
        'Encaminha a atualização parcial de um veículo para o Vehicle Service.',
    }),
    ApiUuidParam('id', 'Identificador do veículo.'),
    ApiBody({
      required: true,
      schema: updateVehicleRequestSchema,
    }),
    ApiOkResponse({
      description: 'Veículo atualizado com sucesso.',
      schema: vehicleResponseSchema,
    }),
    ApiServiceUnavailableResponse({
      description: 'Vehicle Service indisponível.',
      schema: serviceUnavailableResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: true,
      includeConflict: true,
      includeUnauthorized: true,
      includeNotFound: true,
    }),
  );
}
