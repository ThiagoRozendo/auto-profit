import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export function PricingApiTags(): ClassDecorator {
  return applyDecorators(ApiTags('Pricing'));
}
