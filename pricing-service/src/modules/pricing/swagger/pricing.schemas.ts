import { dateTimeSchema, decimalSchema, uuidSchema } from '../../../common/swagger';

export const pricingRuleResponseSchema = {
  type: 'object',
  properties: {
    id: uuidSchema(),
    userId: uuidSchema('11111111-1111-4111-8111-111111111111'),
    defaultProfitMargin: {
      ...decimalSchema(18),
      description: 'Margem padrão de lucro do usuário.',
    },
    createdAt: dateTimeSchema(),
    updatedAt: dateTimeSchema(),
  },
  required: ['id', 'userId', 'defaultProfitMargin', 'createdAt', 'updatedAt'],
};

export const updatePricingRuleRequestSchema = {
  type: 'object',
  properties: {
    defaultProfitMargin: {
      ...decimalSchema(20),
      description: 'Nova margem padrão de lucro.',
    },
  },
  required: ['defaultProfitMargin'],
};

export const pricingCalculationResponseSchema = {
  type: 'object',
  properties: {
    id: uuidSchema(),
    userId: uuidSchema('11111111-1111-4111-8111-111111111111'),
    vehicleId: uuidSchema('22222222-2222-4222-8222-222222222222'),
    purchasePriceSnapshot: decimalSchema(85000),
    totalExpensesSnapshot: decimalSchema(5000),
    totalInvestment: decimalSchema(90000),
    profitMargin: decimalSchema(20),
    expectedProfit: decimalSchema(18000),
    suggestedPrice: decimalSchema(108000),
    createdAt: dateTimeSchema(),
  },
  required: [
    'id',
    'userId',
    'vehicleId',
    'purchasePriceSnapshot',
    'totalExpensesSnapshot',
    'totalInvestment',
    'profitMargin',
    'expectedProfit',
    'suggestedPrice',
    'createdAt',
  ],
};

export const pricingPreviewResponseSchema = {
  type: 'object',
  properties: {
    vehicleId: uuidSchema('22222222-2222-4222-8222-222222222222'),
    vehicleLabel: {
      type: 'string',
      example: 'Honda Civic 2020',
    },
    purchasePrice: decimalSchema(85000),
    totalExpenses: decimalSchema(5000),
    totalInvestment: decimalSchema(90000),
    profitMargin: decimalSchema(20),
    expectedProfit: decimalSchema(18000),
    suggestedPrice: decimalSchema(108000),
    saved: {
      type: 'boolean',
      example: false,
    },
    calculationId: {
      ...uuidSchema('33333333-3333-4333-8333-333333333333'),
      description: 'Presente apenas quando o histórico é salvo.',
    },
  },
  required: [
    'vehicleId',
    'vehicleLabel',
    'purchasePrice',
    'totalExpenses',
    'totalInvestment',
    'profitMargin',
    'expectedProfit',
    'suggestedPrice',
    'saved',
  ],
};

export const calculatePricingRequestSchema = {
  type: 'object',
  properties: {
    vehicleId: uuidSchema('22222222-2222-4222-8222-222222222222'),
    profitMargin: {
      ...decimalSchema(20),
      description: 'Margem de lucro desejada. Se omitida, usa a margem padrão.',
    },
    saveHistory: {
      type: 'boolean',
      example: true,
      description: 'Define se o cálculo deve ser salvo no histórico.',
    },
  },
  required: ['vehicleId'],
};

export const pricingHistoryListResponseSchema = {
  type: 'array',
  items: pricingCalculationResponseSchema,
};
