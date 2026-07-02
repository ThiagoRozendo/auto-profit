import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

interface ApiCommonErrorResponsesOptions {
  includeBadRequest?: boolean;
  includeConflict?: boolean;
  includeUnauthorized?: boolean;
  includeForbidden?: boolean;
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
      statusCode: {
        type: 'integer',
        example: statusCode,
      },
      message: messageSchema,
      error: {
        type: 'string',
        example: error,
      },
    },
    required: ['statusCode', 'message'],
  };
}

export function ApiCommonErrorResponses(
  options: ApiCommonErrorResponsesOptions = {},
): MethodDecorator {
  const {
    includeBadRequest = true,
    includeConflict = false,
    includeUnauthorized = false,
    includeForbidden = false,
    includeNotFound = false,
    includeInternalServerError = true,
  } = options;

  const decorators: MethodDecorator[] = [];

  if (includeBadRequest) {
    decorators.push(
      ApiBadRequestResponse({
        description: 'Dados de entrada inválidos.',
        schema: errorResponseSchema(400, 'Bad Request', [
          'O valor não pode ser negativo',
        ]),
      }),
    );
  }

  if (includeConflict) {
    decorators.push(
      ApiConflictResponse({
        description: 'Conflito de domínio.',
        schema: errorResponseSchema(409, 'Conflict', 'Conflito de dados'),
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

  if (includeForbidden) {
    decorators.push(
      ApiForbiddenResponse({
        description: 'Acesso negado.',
        schema: errorResponseSchema(403, 'Forbidden', 'Recurso proibido'),
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
          'Despesa não encontrada',
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
