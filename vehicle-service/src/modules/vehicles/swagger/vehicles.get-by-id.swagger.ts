import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  ApiCommonErrorResponses,
  ApiUuidParam,
} from '../../../common/swagger';
import { vehicleResponseSchema } from './vehicles.schemas';

export function GetVehicleByIdApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar veículo por ID',
      description:
        'Retorna os detalhes de um veículo pertencente ao usuário autenticado.',
    }),
    ApiUuidParam('id', 'Identificador do veículo.'),
    ApiOkResponse({
      description: 'Veículo encontrado com sucesso.',
      schema: vehicleResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: false,
      includeUnauthorized: true,
      includeNotFound: true,
    }),
  );
}
