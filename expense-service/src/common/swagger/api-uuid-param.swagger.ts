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
      example: '11111111-1111-1111-1111-111111111111',
    }),
  );
}
