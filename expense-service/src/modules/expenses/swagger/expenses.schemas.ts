import { dateTimeSchema, decimalSchema, uuidSchema } from '../../../common/swagger';

const EXPENSE_CATEGORIES = ['MAINTENANCE', 'DOCUMENTATION', 'CLEANING', 'TRANSPORT', 'PARTS', 'OTHER'];

// ─── Request Schemas ─────────────────────────────────────────────────────────

export const createExpenseRequestSchema = {
  type: 'object',
  properties: {
    vehicleId: uuidSchema('22222222-2222-2222-2222-222222222222'),
    vehicleLabel: {
      type: 'string',
      example: 'Honda Civic 2020',
      description: 'Label descritivo do veículo para exibição no frontend.',
    },
    description: {
      type: 'string',
      example: 'Troca de pneus',
      description: 'Descrição da despesa.',
    },
    category: {
      type: 'string',
      enum: EXPENSE_CATEGORIES,
      example: 'MAINTENANCE',
      description: 'Categoria da despesa.',
    },
    amount: {
      ...decimalSchema(1800),
      description: 'Valor da despesa. Deve ser maior ou igual a zero.',
    },
    expenseDate: {
      ...dateTimeSchema('2026-06-25T10:00:00.000Z'),
      description: 'Data da despesa. Se não informado, usa a data atual.',
    },
  },
  required: ['vehicleId', 'description', 'amount'],
};

export const updateExpenseRequestSchema = {
  type: 'object',
  properties: {
    vehicleId: uuidSchema('22222222-2222-2222-2222-222222222222'),
    vehicleLabel: {
      type: 'string',
      example: 'Honda Civic 2020',
    },
    description: {
      type: 'string',
      example: 'Troca de pneus e alinhamento',
    },
    category: {
      type: 'string',
      enum: EXPENSE_CATEGORIES,
      example: 'MAINTENANCE',
    },
    amount: decimalSchema(2100),
    expenseDate: dateTimeSchema('2026-06-25T10:00:00.000Z'),
  },
};

// ─── Response Schemas ─────────────────────────────────────────────────────────

export const expenseResponseSchema = {
  type: 'object',
  properties: {
    id: uuidSchema(),
    userId: uuidSchema('11111111-1111-1111-1111-111111111111'),
    vehicleId: uuidSchema('22222222-2222-2222-2222-222222222222'),
    vehicleLabel: {
      type: 'string',
      example: 'Honda Civic 2020',
      nullable: true,
    },
    description: {
      type: 'string',
      example: 'Troca de pneus',
    },
    category: {
      type: 'string',
      enum: EXPENSE_CATEGORIES,
      example: 'MAINTENANCE',
    },
    amount: decimalSchema(1800),
    expenseDate: dateTimeSchema('2026-06-25T10:00:00.000Z'),
    createdAt: dateTimeSchema(),
    updatedAt: dateTimeSchema(),
  },
  required: ['id', 'userId', 'vehicleId', 'description', 'category', 'amount', 'expenseDate', 'createdAt', 'updatedAt'],
};

export const expenseListResponseSchema = {
  type: 'array',
  items: expenseResponseSchema,
};

export const expenseVehicleTotalResponseSchema = {
  type: 'object',
  properties: {
    vehicleId: uuidSchema('22222222-2222-2222-2222-222222222222'),
    totalExpenses: {
      type: 'number',
      example: 3500,
      description: 'Soma total das despesas do veículo.',
    },
    count: {
      type: 'integer',
      example: 3,
      description: 'Quantidade de despesas do veículo.',
    },
  },
  required: ['vehicleId', 'totalExpenses', 'count'],
};
