import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../../common/swagger';
import { VehicleStatus } from '../dto/vehicle-status.enum';
import {
  serviceUnavailableResponseSchema,
  vehiclesListResponseSchema,
} from './vehicles.schemas';

export function ListVehiclesApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Listar veículos',
      description:
        'Encaminha a busca de veículos do usuário autenticado para o Vehicle Service.',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: VehicleStatus,
      description: 'Filtrar por status do veículo.',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Buscar por marca, modelo ou placa.',
    }),
    ApiOkResponse({
      description: 'Lista de veículos retornada com sucesso.',
      schema: vehiclesListResponseSchema,
    }),
    ApiServiceUnavailableResponse({
      description: 'Vehicle Service indisponível.',
      schema: serviceUnavailableResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: false,
      includeUnauthorized: true,
    }),
  );
}
