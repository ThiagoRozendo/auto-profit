export type UserRole = 'ADMIN' | 'MANAGER' | 'SELLER';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
