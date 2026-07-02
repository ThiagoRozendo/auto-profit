import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../../common/swagger';
import {
  createVehicleRequestSchema,
  vehicleResponseSchema,
} from './vehicles.schemas';

export function CreateVehicleApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastrar veículo',
      description:
        'Cria um novo veículo associado ao usuário autenticado pelo API Gateway.',
    }),
    ApiBody({
      required: true,
      schema: createVehicleRequestSchema,
    }),
    ApiCreatedResponse({
      description: 'Veículo criado com sucesso.',
      schema: vehicleResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: true,
      includeConflict: true,
      includeUnauthorized: true,
    }),
  );
}
