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
      summary: 'Autenticar usuário via Gateway',
      description:
        'Encaminha as credenciais recebidas para o Auth Service e retorna o access token JWT emitido por ele quando a autenticação é bem-sucedida.',
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
      description: 'Auth Service indisponível para processar o login.',
      schema: authServiceUnavailableResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: true,
      includeUnauthorized: true,
    }),
  );
}
