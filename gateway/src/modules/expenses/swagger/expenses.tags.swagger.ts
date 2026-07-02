import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export function ExpensesApiTags(): ClassDecorator {
  return applyDecorators(ApiTags('Expenses'));
}
