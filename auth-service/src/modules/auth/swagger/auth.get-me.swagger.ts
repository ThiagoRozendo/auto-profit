import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../../common/swagger';
import { safeUserResponseSchema } from './auth.schemas';

export function GetMeAuthApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Buscar usuario autenticado',
      description:
        'Retorna os dados publicos do usuario representado pelo token JWT informado.',
    }),
    ApiOkResponse({
      description: 'Usuario autenticado encontrado com sucesso.',
      schema: safeUserResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: false,
      includeUnauthorized: true,
      includeNotFound: true,
    }),
  );
}
