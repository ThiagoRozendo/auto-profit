import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export function VehiclesApiTags(): ClassDecorator {
  return applyDecorators(ApiTags('Vehicles'));
}
