import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

interface ApiCommonErrorResponsesOptions {
  includeBadRequest?: boolean;
  includeUnauthorized?: boolean;
  includeNotFound?: boolean;
  includeInternalServerError?: boolean;
}

function errorResponseSchema(
  statusCode: number,
  error: string,
  message: string | string[],
) {
  const messageSchema = Array.isArray(message)
    ? {
        type: 'array',
        items: { type: 'string' },
        example: message,
      }
    : {
        type: 'string',
        example: message,
      };

  return {
    type: 'object',
    properties: {
      statusCode: { type: 'integer', example: statusCode },
      message: messageSchema,
      error: { type: 'string', example: error },
    },
    required: ['statusCode', 'message'],
  };
}

export function ApiCommonErrorResponses(
  options: ApiCommonErrorResponsesOptions = {},
): MethodDecorator {
  const {
    includeBadRequest = true,
    includeUnauthorized = false,
    includeNotFound = false,
    includeInternalServerError = true,
  } = options;

  const decorators: MethodDecorator[] = [];

  if (includeBadRequest) {
    decorators.push(
      ApiBadRequestResponse({
        description: 'Dados de entrada inválidos.',
        schema: errorResponseSchema(400, 'Bad Request', [
          'A margem de lucro não pode ser negativa',
        ]),
      }),
    );
  }

  if (includeUnauthorized) {
    decorators.push(
      ApiUnauthorizedResponse({
        description: 'Header x-user-id ausente ou inválido.',
        schema: errorResponseSchema(
          401,
          'Unauthorized',
          'Usuário autenticado não informado',
        ),
      }),
    );
  }

  if (includeNotFound) {
    decorators.push(
      ApiNotFoundResponse({
        description: 'Recurso não encontrado.',
        schema: errorResponseSchema(
          404,
          'Not Found',
          'Veículo não encontrado',
        ),
      }),
    );
  }

  if (includeInternalServerError) {
    decorators.push(
      ApiInternalServerErrorResponse({
        description: 'Erro interno inesperado.',
        schema: errorResponseSchema(
          500,
          'Internal Server Error',
          'Erro interno do servidor',
        ),
      }),
    );
  }

  return applyDecorators(...decorators);
}
