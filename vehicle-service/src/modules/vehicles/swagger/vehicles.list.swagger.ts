import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../../common/swagger';
import { VehicleStatus } from '../../../generated/prisma/client';
import { vehiclesListResponseSchema } from './vehicles.schemas';

export function ListVehiclesApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar veículos',
      description:
        'Retorna os veículos do usuário autenticado, com filtros opcionais por status e busca textual.',
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
    ApiCommonErrorResponses({
      includeBadRequest: false,
      includeUnauthorized: true,
    }),
  );
}
