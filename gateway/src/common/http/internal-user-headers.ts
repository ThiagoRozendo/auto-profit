import type { JwtPayload } from '../auth/jwt-payload.interface';

export function buildInternalUserHeaders(user: JwtPayload): Record<string, string> {
  return {
    'x-user-id': user.sub,
    'x-user-email': user.email,
    'x-user-role': user.role,
  };
}
