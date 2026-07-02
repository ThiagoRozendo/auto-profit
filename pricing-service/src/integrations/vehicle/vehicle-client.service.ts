import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

export interface VehicleResponse {
  id: string;
  ownerId: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  purchasePrice: number;
  status: string;
}

@Injectable()
export class VehicleClientService {
  private readonly baseUrl = process.env.VEHICLE_SERVICE_URL ?? 'http://localhost:3003';

  async findById(vehicleId: string, userId: string): Promise<VehicleResponse> {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}/vehicles/${vehicleId}`, {
        headers: { 'x-user-id': userId },
      });
    } catch {
      throw new ServiceUnavailableException('Vehicle Service indisponível');
    }

    if (response.status === 404) {
      throw new NotFoundException('Veículo não encontrado');
    }

    if (!response.ok) {
      throw new ServiceUnavailableException('Vehicle Service indisponível');
    }

    return (await response.json()) as VehicleResponse;
  }
}
