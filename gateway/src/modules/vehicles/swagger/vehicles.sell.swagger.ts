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
  sellVehicleRequestSchema,
  serviceUnavailableResponseSchema,
  vehicleResponseSchema,
} from './vehicles.schemas';

export function SellVehicleApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Registrar venda de veículo',
      description:
        'Encaminha o registro de venda de um veículo para o Vehicle Service.',
    }),
    ApiUuidParam('id', 'Identificador do veículo.'),
    ApiBody({
      required: true,
      schema: sellVehicleRequestSchema,
    }),
    ApiOkResponse({
      description: 'Venda registrada com sucesso.',
      schema: vehicleResponseSchema,
    }),
    ApiServiceUnavailableResponse({
      description: 'Vehicle Service indisponível.',
      schema: serviceUnavailableResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: true,
      includeUnauthorized: true,
      includeNotFound: true,
    }),
  );
}
