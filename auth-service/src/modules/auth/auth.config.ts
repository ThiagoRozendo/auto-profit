import type { StringValue } from 'ms';

const DEVELOPMENT_JWT_SECRET = 'development-secret';
const DEVELOPMENT_JWT_EXPIRES_IN = '1d' as StringValue;

export function getJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET?.trim();

  if (jwtSecret) {
    return jwtSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET não configurado para o auth-service.');
  }

  return DEVELOPMENT_JWT_SECRET;
}

export function getJwtExpiresIn(): StringValue | number {
  const expiresIn = process.env.JWT_EXPIRES_IN?.trim();

  if (!expiresIn) {
    return DEVELOPMENT_JWT_EXPIRES_IN;
  }

  if (/^\d+$/.test(expiresIn)) {
    return Number(expiresIn);
  }

  return expiresIn as StringValue;
}
