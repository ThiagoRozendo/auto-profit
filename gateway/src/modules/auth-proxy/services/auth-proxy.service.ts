import { Injectable } from '@nestjs/common';
import { InternalHttpService } from '../../../common/http/internal-http.service';
import type { LoginDto } from '../dto/login.dto';
import type { RegisterDto } from '../dto/register.dto';

export interface SafeUserResponse {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'SELLER';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthPayloadResponse {
  accessToken: string;
}

@Injectable()
export class AuthProxyService {
  constructor(private readonly internalHttpService: InternalHttpService) {}

  async register(dto: RegisterDto): Promise<SafeUserResponse> {
    return this.internalHttpService.post<SafeUserResponse>(
      `${getAuthServiceUrl()}/auth/register`,
      dto,
    );
  }

  async login(dto: LoginDto): Promise<AuthPayloadResponse> {
    return this.internalHttpService.post<AuthPayloadResponse>(
      `${getAuthServiceUrl()}/auth/login`,
      dto,
    );
  }

  async getMe(authorization?: string): Promise<SafeUserResponse> {
    const headers = authorization ? { authorization } : undefined;

    return this.internalHttpService.get<SafeUserResponse>(
      `${getAuthServiceUrl()}/auth/me`,
      headers,
    );
  }
}

function getAuthServiceUrl(): string {
  return process.env.AUTH_SERVICE_URL?.trim() || 'http://localhost:3002';
}
