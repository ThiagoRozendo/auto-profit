import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  ApiCommonErrorResponses,
  ApiUuidParam,
} from '../../../common/swagger';
import {
  sellVehicleRequestSchema,
  vehicleResponseSchema,
} from './vehicles.schemas';

export function SellVehicleApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Registrar venda de veículo',
      description:
        'Marca um veículo como vendido, registrando preço e data da venda.',
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
    ApiCommonErrorResponses({
      includeBadRequest: true,
      includeUnauthorized: true,
      includeNotFound: true,
    }),
  );
}
