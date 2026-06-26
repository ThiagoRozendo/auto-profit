import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../../common/swagger';
import {
  authServiceUnavailableResponseSchema,
  safeUserResponseSchema,
} from './auth.schemas';

export function GetMeAuthApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Buscar usuário autenticado via Gateway',
      description:
        'Repassa o Bearer token recebido pelo Gateway para o Auth Service e retorna os dados públicos do usuário autenticado.',
    }),
    ApiOkResponse({
      description: 'Usuário autenticado retornado com sucesso pelo Auth Service.',
      schema: safeUserResponseSchema,
    }),
    ApiServiceUnavailableResponse({
      description: 'Auth Service indisponível para consultar o usuário autenticado.',
      schema: authServiceUnavailableResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: false,
      includeUnauthorized: true,
      includeNotFound: true,
    }),
  );
}
