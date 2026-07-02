import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../../common/swagger';
import {
  createVehicleRequestSchema,
  serviceUnavailableResponseSchema,
  vehicleResponseSchema,
} from './vehicles.schemas';

export function CreateVehicleApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Cadastrar veículo',
      description:
        'Encaminha o cadastro de um veículo para o Vehicle Service e retorna o recurso criado.',
    }),
    ApiBody({
      required: true,
      schema: createVehicleRequestSchema,
    }),
    ApiCreatedResponse({
      description: 'Veículo criado com sucesso.',
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
    }),
  );
}
