import {
  dateTimeSchema,
  emailSchema,
  uuidSchema,
} from '../../../common/swagger';

export const registerRequestSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      example: 'Joao Silva',
      description: 'Nome do usuario.',
    },
    email: emailSchema(),
    password: {
      type: 'string',
      minLength: 6,
      example: '123456',
      description: 'Senha com no minimo 6 caracteres.',
    },
  },
  required: ['name', 'email', 'password'],
};

export const loginRequestSchema = {
  type: 'object',
  properties: {
    email: emailSchema(),
    password: {
      type: 'string',
      example: '123456',
      description: 'Senha do usuario.',
    },
  },
  required: ['email', 'password'],
};

export const safeUserResponseSchema = {
  type: 'object',
  properties: {
    id: uuidSchema(),
    name: {
      type: 'string',
      example: 'Joao Silva',
    },
    email: emailSchema(),
    role: {
      type: 'string',
      enum: ['ADMIN', 'MANAGER', 'SELLER'],
      example: 'SELLER',
    },
    createdAt: dateTimeSchema(),
    updatedAt: dateTimeSchema(),
  },
  required: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
};

export const authPayloadResponseSchema = {
  type: 'object',
  properties: {
    accessToken: {
      type: 'string',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.signature',
      description: 'JWT de acesso para chamadas autenticadas.',
    },
  },
  required: ['accessToken'],
};
