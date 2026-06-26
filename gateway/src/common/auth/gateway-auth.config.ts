const DEVELOPMENT_JWT_SECRET = 'development-secret';

export function getJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET?.trim();

  if (jwtSecret) {
    return jwtSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET nao configurado para o gateway.');
  }

  return DEVELOPMENT_JWT_SECRET;
}
