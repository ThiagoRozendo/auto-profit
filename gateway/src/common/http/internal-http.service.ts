import {
  HttpException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InternalHttpService {
  constructor(private readonly httpService: HttpService) {}

  async get<T>(
    url: string,
    headers?: Record<string, string>,
  ): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<T>(url, {
          headers,
        }),
      );

      return response.data;
    } catch (error) {
      throw mapInternalHttpError(error);
    }
  }

  async post<T>(
    url: string,
    data: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<T>(url, data, {
          headers,
        }),
      );

      return response.data;
    } catch (error) {
      throw mapInternalHttpError(error);
    }
  }
}

function mapInternalHttpError(error: unknown): HttpException {
  if (isAxiosError(error) && error.response) {
    throw new HttpException(
      normalizeErrorResponse(error.response.data),
      error.response.status,
    );
  }

  return new ServiceUnavailableException('Auth Service indisponivel');
}

function normalizeErrorResponse(
  payload: unknown,
): string | Record<string, unknown> {
  if (typeof payload === 'string') {
    return payload;
  }

  if (typeof payload === 'object' && payload !== null) {
    return payload as Record<string, unknown>;
  }

  return {
    message: 'Unexpected upstream error',
  };
}
