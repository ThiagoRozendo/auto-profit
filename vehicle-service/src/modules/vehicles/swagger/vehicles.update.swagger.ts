import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  ApiCommonErrorResponses,
  ApiUuidParam,
} from '../../../common/swagger';
import {
  updateVehicleRequestSchema,
  vehicleResponseSchema,
} from './vehicles.schemas';

export function UpdateVehicleApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar veículo',
      description:
        'Atualiza parcialmente um veículo pertencente ao usuário autenticado.',
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
    ApiCommonErrorResponses({
      includeBadRequest: true,
      includeConflict: true,
      includeUnauthorized: true,
      includeNotFound: true,
    }),
  );
}
