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
      example: '9d2b4b4e-5f71-4d7f-94b8-8f43a8b3c8c2',
    }),
  );
}
