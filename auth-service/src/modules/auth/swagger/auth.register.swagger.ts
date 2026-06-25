import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../../common/swagger';
import {
  registerRequestSchema,
  safeUserResponseSchema,
} from './auth.schemas';

export function RegisterAuthApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastrar um novo usuario',
      description:
        'Cria um novo usuario no servico de autenticacao e retorna os dados publicos do cadastro.',
    }),
    ApiBody({
      required: true,
      schema: registerRequestSchema,
    }),
    ApiCreatedResponse({
      description: 'Usuario criado com sucesso.',
      schema: safeUserResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: true,
      includeConflict: true,
    }),
  );
}
