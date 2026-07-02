import { ExpenseCategory } from '../../../generated/prisma/client';
import { dateTimeSchema, decimalSchema, uuidSchema } from '../../../common/swagger';

export const expenseCategoryEnumValues = [
  ExpenseCategory.MAINTENANCE,
  ExpenseCategory.DOCUMENTATION,
  ExpenseCategory.CLEANING,
  ExpenseCategory.TRANSPORT,
  ExpenseCategory.PARTS,
  ExpenseCategory.OTHER,
];

export const createExpenseRequestSchema = {
  type: 'object',
  properties: {
    vehicleId: uuidSchema('22222222-2222-4222-8222-222222222222'),
    vehicleLabel: {
      type: 'string',
      example: 'Honda Civic 2020',
      description: 'Rótulo descritivo do veículo para exibição no frontend.',
    },
    description: {
      type: 'string',
      example: 'Troca de pneus',
      description: 'Descrição da despesa.',
    },
    category: {
      type: 'string',
      enum: expenseCategoryEnumValues,
      example: 'MAINTENANCE',
      description: 'Categoria da despesa.',
    },
    amount: {
      ...decimalSchema(1800),
      description: 'Valor da despesa. Deve ser maior ou igual a zero.',
    },
    expenseDate: {
      ...dateTimeSchema('2026-06-25T10:00:00.000Z'),
      description: 'Data da despesa. Se não for informada, a API usa a data atual.',
    },
  },
  required: ['vehicleId', 'description', 'amount'],
};

export const updateExpenseRequestSchema = {
  type: 'object',
  properties: {
    vehicleId: uuidSchema('22222222-2222-4222-8222-222222222222'),
    vehicleLabel: {
      type: 'string',
      example: 'Honda Civic 2020',
      description: 'Rótulo atualizado do veículo para exibição.',
    },
    description: {
      type: 'string',
      example: 'Troca de pneus e alinhamento',
      description: 'Descrição atualizada da despesa.',
    },
    category: {
      type: 'string',
      enum: expenseCategoryEnumValues,
      example: 'MAINTENANCE',
      description: 'Nova categoria da despesa.',
    },
    amount: {
      ...decimalSchema(2100),
      description: 'Novo valor da despesa.',
    },
    expenseDate: {
      ...dateTimeSchema('2026-06-25T10:00:00.000Z'),
      description: 'Nova data da despesa.',
    },
  },
};

export const expenseResponseSchema = {
  type: 'object',
  properties: {
    id: uuidSchema(),
    userId: uuidSchema('11111111-1111-4111-8111-111111111111'),
    vehicleId: uuidSchema('22222222-2222-4222-8222-222222222222'),
    vehicleLabel: {
      type: 'string',
      example: 'Honda Civic 2020',
      description: 'Rótulo do veículo associado à despesa.',
      nullable: true,
    },
    description: {
      type: 'string',
      example: 'Troca de pneus',
      description: 'Descrição da despesa.',
    },
    category: {
      type: 'string',
      enum: expenseCategoryEnumValues,
      example: 'MAINTENANCE',
      description: 'Categoria da despesa.',
    },
    amount: {
      ...decimalSchema(1800),
      description: 'Valor da despesa.',
    },
    expenseDate: {
      ...dateTimeSchema('2026-06-25T10:00:00.000Z'),
      description: 'Data em que a despesa ocorreu.',
    },
    createdAt: {
      ...dateTimeSchema(),
      description: 'Data de criação do registro.',
    },
    updatedAt: {
      ...dateTimeSchema(),
      description: 'Data da última atualização do registro.',
    },
  },
  required: [
    'id',
    'userId',
    'vehicleId',
    'description',
    'category',
    'amount',
    'expenseDate',
    'createdAt',
    'updatedAt',
  ],
};

export const expenseListResponseSchema = {
  type: 'array',
  items: expenseResponseSchema,
};

export const expenseVehicleTotalResponseSchema = {
  type: 'object',
  properties: {
    vehicleId: uuidSchema('22222222-2222-4222-8222-222222222222'),
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
