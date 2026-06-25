import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../../common/swagger';
import {
  authServiceUnavailableResponseSchema,
  registerRequestSchema,
  safeUserResponseSchema,
} from './auth.schemas';

export function RegisterAuthApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastrar usuario via Gateway',
      description:
        'Recebe os dados de cadastro no Gateway, encaminha a requisicao para o Auth Service e devolve a mesma resposta publica do usuario criado.',
    }),
    ApiBody({
      required: true,
      schema: registerRequestSchema,
    }),
    ApiCreatedResponse({
      description: 'Usuario criado com sucesso pelo Auth Service.',
      schema: safeUserResponseSchema,
    }),
    ApiServiceUnavailableResponse({
      description: 'Auth Service indisponivel para processar o cadastro.',
      schema: authServiceUnavailableResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: true,
      includeConflict: true,
    }),
  );
}
