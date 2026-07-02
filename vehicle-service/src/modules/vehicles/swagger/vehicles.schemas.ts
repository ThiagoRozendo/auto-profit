import {
  dateTimeSchema,
  uuidSchema,
} from '../../../common/swagger';
import { VehicleStatus } from '../../../generated/prisma/client';

export const createVehicleRequestSchema = {
  type: 'object',
  properties: {
    brand: {
      type: 'string',
      example: 'Honda',
      description: 'Marca do veículo.',
    },
    model: {
      type: 'string',
      example: 'Civic',
      description: 'Modelo do veículo.',
    },
    year: {
      type: 'integer',
      example: 2020,
      description: 'Ano de fabricação.',
    },
    plate: {
      type: 'string',
      example: 'ABC1D23',
      description: 'Placa única do veículo.',
    },
    purchasePrice: {
      type: 'number',
      example: 85000,
      description: 'Valor de compra do veículo.',
    },
    status: {
      type: 'string',
      enum: Object.values(VehicleStatus),
      example: VehicleStatus.AVAILABLE,
      description: 'Status inicial do veículo.',
    },
    observations: {
      type: 'string',
      example: 'Veículo em bom estado.',
      nullable: true,
      description: 'Observações gerais.',
    },
  },
  required: ['brand', 'model', 'year', 'plate', 'purchasePrice'],
};

export const updateVehicleRequestSchema = {
  type: 'object',
  properties: {
    brand: {
      type: 'string',
      example: 'Honda',
    },
    model: {
      type: 'string',
      example: 'Civic Touring',
    },
    year: {
      type: 'integer',
      example: 2021,
    },
    plate: {
      type: 'string',
      example: 'ABC1D23',
    },
    purchasePrice: {
      type: 'number',
      example: 88000,
    },
    status: {
      type: 'string',
      enum: Object.values(VehicleStatus),
      example: VehicleStatus.RESERVED,
    },
    observations: {
      type: 'string',
      example: 'Revisão feita em concessionária.',
      nullable: true,
    },
  },
};

export const sellVehicleRequestSchema = {
  type: 'object',
  properties: {
    salePrice: {
      type: 'number',
      example: 95000,
      description: 'Preço de venda do veículo.',
    },
    soldAt: {
      ...dateTimeSchema(),
      description: 'Data da venda em formato ISO 8601.',
    },
    saleNotes: {
      type: 'string',
      example: 'Venda à vista.',
      nullable: true,
      description: 'Observações sobre a venda.',
    },
  },
  required: ['salePrice'],
};

export const vehicleResponseSchema = {
  type: 'object',
  properties: {
    id: uuidSchema(),
    ownerId: uuidSchema('11111111-1111-1111-1111-111111111111'),
    brand: {
      type: 'string',
      example: 'Honda',
    },
    model: {
      type: 'string',
      example: 'Civic',
    },
    year: {
      type: 'integer',
      example: 2020,
    },
    plate: {
      type: 'string',
      example: 'ABC1D23',
    },
    purchasePrice: {
      type: 'number',
      example: 85000,
    },
    status: {
      type: 'string',
      enum: Object.values(VehicleStatus),
      example: VehicleStatus.AVAILABLE,
    },
    observations: {
      type: 'string',
      example: 'Veículo em bom estado.',
      nullable: true,
    },
    soldAt: {
      ...dateTimeSchema(),
      nullable: true,
    },
    salePrice: {
      type: 'number',
      example: 95000,
      nullable: true,
    },
    saleNotes: {
      type: 'string',
      example: 'Venda à vista.',
      nullable: true,
    },
    createdAt: dateTimeSchema(),
    updatedAt: dateTimeSchema(),
  },
  required: [
    'id',
    'ownerId',
    'brand',
    'model',
    'year',
    'plate',
    'purchasePrice',
    'status',
    'createdAt',
    'updatedAt',
  ],
};

export const vehiclesListResponseSchema = {
  type: 'array',
  items: vehicleResponseSchema,
};
