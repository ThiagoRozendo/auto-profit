import { applyDecorators } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

export function VehiclesApiTags(): ClassDecorator {
  return applyDecorators(
    ApiTags('Vehicles'),
    ApiHeader({
      name: 'x-user-id',
      required: true,
      description:
        'UUID do usuário autenticado. Enviado automaticamente pelo API Gateway.',
      schema: {
        type: 'string',
        format: 'uuid',
      },
      example: '11111111-1111-1111-1111-111111111111',
    }),
    ApiHeader({
      name: 'x-user-email',
      required: false,
      description:
        'E-mail do usuário autenticado. Enviado automaticamente pelo API Gateway.',
      schema: {
        type: 'string',
        format: 'email',
      },
      example: 'joao.silva@example.com',
    }),
    ApiHeader({
      name: 'x-user-role',
      required: false,
      description:
        'Papel do usuário autenticado. Enviado automaticamente pelo API Gateway.',
      schema: {
        type: 'string',
      },
      example: 'SELLER',
    }),
  );
}
