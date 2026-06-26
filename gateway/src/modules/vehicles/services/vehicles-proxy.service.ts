import { Injectable } from '@nestjs/common';
import { InternalHttpService } from '../../../common/http/internal-http.service';

function getVehicleServiceUrl(): string {
  return (
    process.env.VEHICLE_SERVICE_URL?.trim() ?? 'http://vehicle-service:3003'
  );
}

@Injectable()
export class VehiclesProxyService {
  constructor(private readonly internalHttpService: InternalHttpService) {}

  create(body: Record<string, unknown>, headers: Record<string, string>) {
    return this.internalHttpService.post(
      `${getVehicleServiceUrl()}/vehicles`,
      body,
      headers,
    );
  }

  findAll(
    headers: Record<string, string>,
    query: { status?: string; search?: string },
  ) {
    const params = new URLSearchParams();
    if (query.status) params.append('status', query.status);
    if (query.search) params.append('search', query.search);

    const qs = params.toString();
    const url = qs
      ? `${getVehicleServiceUrl()}/vehicles?${qs}`
      : `${getVehicleServiceUrl()}/vehicles`;

    return this.internalHttpService.get(url, headers);
  }

  findOne(id: string, headers: Record<string, string>) {
    return this.internalHttpService.get(
      `${getVehicleServiceUrl()}/vehicles/${id}`,
      headers,
    );
  }

  update(
    id: string,
    body: Record<string, unknown>,
    headers: Record<string, string>,
  ) {
    return this.internalHttpService.patch(
      `${getVehicleServiceUrl()}/vehicles/${id}`,
      body,
      headers,
    );
  }

  remove(id: string, headers: Record<string, string>) {
    return this.internalHttpService.delete(
      `${getVehicleServiceUrl()}/vehicles/${id}`,
      headers,
    );
  }

  sell(
    id: string,
    body: Record<string, unknown>,
    headers: Record<string, string>,
  ) {
    return this.internalHttpService.patch(
      `${getVehicleServiceUrl()}/vehicles/${id}/sell`,
      body,
      headers,
    );
  }
}
