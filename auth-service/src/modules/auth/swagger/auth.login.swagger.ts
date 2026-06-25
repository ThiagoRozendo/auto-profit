import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../../common/swagger';
import {
  authPayloadResponseSchema,
  loginRequestSchema,
} from './auth.schemas';

export function LoginAuthApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Autenticar usuario',
      description:
        'Valida as credenciais informadas e retorna um token JWT para acesso aos endpoints protegidos.',
    }),
    ApiBody({
      required: true,
      schema: loginRequestSchema,
    }),
    ApiOkResponse({
      description: 'Token JWT gerado com sucesso.',
      schema: authPayloadResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: true,
      includeUnauthorized: true,
    }),
  );
}
