import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
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
  vehicleResponseSchema,
} from './vehicles.schemas';

export function GetVehicleByIdApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Buscar veículo por ID',
      description:
        'Encaminha a busca de um veículo específico para o Vehicle Service.',
    }),
    ApiUuidParam('id', 'Identificador do veículo.'),
    ApiOkResponse({
      description: 'Veículo encontrado com sucesso.',
      schema: vehicleResponseSchema,
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
