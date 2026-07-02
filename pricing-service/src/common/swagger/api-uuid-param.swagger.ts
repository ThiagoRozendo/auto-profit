import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

export function ApiUuidParam(
  name: string,
  description: string,
): MethodDecorator {
  return applyDecorators(
    ApiParam({
      name,
      description,
      schema: {
        type: 'string',
        format: 'uuid',
      },
      example: '22222222-2222-4222-8222-222222222222',
    }),
  );
}
