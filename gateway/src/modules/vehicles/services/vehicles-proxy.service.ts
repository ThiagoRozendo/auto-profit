import { Injectable } from '@nestjs/common';
import { InternalHttpService } from '../../../common/http/internal-http.service';
import type { CreateVehicleDto } from '../dto/create-vehicle.dto';
import type { ListVehiclesQueryDto } from '../dto/list-vehicles-query.dto';
import type { SellVehicleDto } from '../dto/sell-vehicle.dto';
import type { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import type { VehicleStatus } from '../dto/vehicle-status.enum';

function getVehicleServiceUrl(): string {
  return (
    process.env.VEHICLE_SERVICE_URL?.trim() ?? 'http://vehicle-service:3003'
  );
}

export interface VehicleResponse {
  id: string;
  ownerId: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  purchasePrice: number;
  status: VehicleStatus;
  observations?: string | null;
  soldAt?: string | null;
  salePrice?: number | null;
  saleNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class VehiclesProxyService {
  constructor(private readonly internalHttpService: InternalHttpService) {}

  create(
    dto: CreateVehicleDto,
    headers: Record<string, string>,
  ): Promise<VehicleResponse> {
    return this.internalHttpService.post<VehicleResponse>(
      `${getVehicleServiceUrl()}/vehicles`,
      dto,
      headers,
    );
  }

  findAll(
    headers: Record<string, string>,
    query: ListVehiclesQueryDto,
  ): Promise<VehicleResponse[]> {
    const params = new URLSearchParams();
    if (query.status) params.append('status', query.status);
    if (query.search) params.append('search', query.search);

    const qs = params.toString();
    const url = qs
      ? `${getVehicleServiceUrl()}/vehicles?${qs}`
      : `${getVehicleServiceUrl()}/vehicles`;

    return this.internalHttpService.get<VehicleResponse[]>(url, headers);
  }

  findOne(id: string, headers: Record<string, string>): Promise<VehicleResponse> {
    return this.internalHttpService.get<VehicleResponse>(
      `${getVehicleServiceUrl()}/vehicles/${id}`,
      headers,
    );
  }

  update(
    id: string,
    dto: UpdateVehicleDto,
    headers: Record<string, string>,
  ): Promise<VehicleResponse> {
    return this.internalHttpService.patch<VehicleResponse>(
      `${getVehicleServiceUrl()}/vehicles/${id}`,
      dto,
      headers,
    );
  }

  remove(id: string, headers: Record<string, string>): Promise<void> {
    return this.internalHttpService.delete<void>(
      `${getVehicleServiceUrl()}/vehicles/${id}`,
      headers,
    );
  }

  sell(
    id: string,
    dto: SellVehicleDto,
    headers: Record<string, string>,
  ): Promise<VehicleResponse> {
    return this.internalHttpService.patch<VehicleResponse>(
      `${getVehicleServiceUrl()}/vehicles/${id}/sell`,
      dto,
      headers,
    );
  }
}
