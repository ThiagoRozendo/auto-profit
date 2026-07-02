import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../../common/swagger';
import {
  expenseCategoryEnumValues,
  expenseListResponseSchema,
} from './expenses.schemas';

export function ListExpensesApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar despesas',
      description:
        'Retorna as despesas do usuário autenticado. ' +
        'Aceita filtros opcionais por veículo, categoria, texto e intervalo de datas.',
    }),
    ApiQuery({
      name: 'vehicleId',
      required: false,
      schema: { type: 'string', format: 'uuid' },
      description: 'Filtrar despesas de um veículo específico.',
      example: '22222222-2222-4222-8222-222222222222',
    }),
    ApiQuery({
      name: 'category',
      required: false,
      enum: expenseCategoryEnumValues,
      description: 'Filtrar por categoria.',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      schema: { type: 'string' },
      description: 'Buscar por descrição ou rótulo do veículo.',
      example: 'pneus',
    }),
    ApiQuery({
      name: 'startDate',
      required: false,
      schema: { type: 'string', format: 'date-time' },
      description: 'Filtrar despesas a partir desta data (ISO 8601).',
      example: '2026-06-01T00:00:00.000Z',
    }),
    ApiQuery({
      name: 'endDate',
      required: false,
      schema: { type: 'string', format: 'date-time' },
      description: 'Filtrar despesas até esta data (ISO 8601).',
      example: '2026-06-30T23:59:59.999Z',
    }),
    ApiOkResponse({
      description: 'Lista de despesas retornada com sucesso.',
      schema: expenseListResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeUnauthorized: true,
      includeInternalServerError: true,
    }),
  );
}
