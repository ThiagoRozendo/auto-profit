import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../../common/swagger';
import { ExpenseCategory } from '../dto/expense-category.enum';
import {
  expensesListResponseSchema,
  serviceUnavailableResponseSchema,
} from './expenses.schemas';

export function ListExpensesApiDocs(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Listar despesas',
      description:
        'Encaminha a busca de despesas do usuário autenticado para o Expense Service.',
    }),
    ApiQuery({
      name: 'vehicleId',
      required: false,
      type: String,
      description: 'Filtrar despesas de um veículo específico.',
      example: '22222222-2222-4222-8222-222222222222',
    }),
    ApiQuery({
      name: 'category',
      required: false,
      enum: ExpenseCategory,
      description: 'Filtrar por categoria.',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Buscar por descrição ou rótulo do veículo.',
    }),
    ApiQuery({
      name: 'startDate',
      required: false,
      type: String,
      description: 'Filtrar despesas a partir desta data.',
      example: '2026-06-01T00:00:00.000Z',
    }),
    ApiQuery({
      name: 'endDate',
      required: false,
      type: String,
      description: 'Filtrar despesas até esta data.',
      example: '2026-06-30T23:59:59.999Z',
    }),
    ApiOkResponse({
      description: 'Lista de despesas retornada com sucesso.',
      schema: expensesListResponseSchema,
    }),
    ApiServiceUnavailableResponse({
      description: 'Expense Service indisponível.',
      schema: serviceUnavailableResponseSchema,
    }),
    ApiCommonErrorResponses({
      includeBadRequest: false,
      includeUnauthorized: true,
    }),
  );
}
