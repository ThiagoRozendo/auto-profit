import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export function AuthApiTags(): ClassDecorator {
  return applyDecorators(ApiTags('Auth'));
}
