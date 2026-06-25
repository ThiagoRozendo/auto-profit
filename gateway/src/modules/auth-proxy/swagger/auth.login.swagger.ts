import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../../common/swagger';
import {
  authPayloadResponseSchema,
  authServiceUnavailableResponseSchema,
  loginRequestSchema,
} from './auth.schemas';

export function LoginAuthApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Autenticar usuario via Gateway',
      description:
        'Encaminha as credenciais recebidas para o Auth Service e retorna o access token JWT emitido por ele quando a autenticacao e bem-sucedida.',
    }),
    ApiBody({
      required: true,
      schema: loginRequestSchema,
    }),
    ApiOkResponse({
      description: 'Token JWT retornado com sucesso pelo Auth Service.',
      schema: authPayloadResponseSchema,
    }),
    ApiServiceUnavailableResponse({
      description: 'Auth Service indisponivel para processar o login.',
      schema: authServiceUnavailableResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: true,
      includeUnauthorized: true,
    }),
  );
}
