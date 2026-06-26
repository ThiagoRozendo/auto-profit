import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, VehicleStatus } from '../../../generated/prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { SellVehicleDto } from '../dto/sell-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  private serialize<
    T extends {
      purchasePrice: Prisma.Decimal | number | null;
      salePrice: Prisma.Decimal | number | null;
    },
  >(vehicle: T) {
    return {
      ...vehicle,
      purchasePrice:
        vehicle.purchasePrice != null ? Number(vehicle.purchasePrice) : null,
      salePrice:
        vehicle.salePrice != null ? Number(vehicle.salePrice) : null,
    };
  }

  /**
   * Retorna o veículo se existir e pertencer ao usuário.
   * Lança NotFoundException caso contrário, sem expor dados de outro usuário.
   */
  private async findOwnedOrFail(id: string, ownerId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, ownerId },
    });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    return vehicle;
  }

  async create(dto: CreateVehicleDto, ownerId: string) {
    const existing = await this.prisma.vehicle.findUnique({
      where: { plate: dto.plate },
    });

    if (existing) {
      throw new ConflictException('Já existe um veículo com esta placa');
    }

    const vehicle = await this.prisma.vehicle.create({
      data: {
        ownerId,
        brand: dto.brand,
        model: dto.model,
        year: dto.year,
        plate: dto.plate,
        purchasePrice: dto.purchasePrice,
        status: dto.status ?? VehicleStatus.AVAILABLE,
        observations: dto.observations ?? null,
      },
    });

    return this.serialize(vehicle);
  }

  async findAll(
    ownerId: string,
    filters: { status?: VehicleStatus; search?: string },
  ) {
    const where: Prisma.VehicleWhereInput = { ownerId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      const term = filters.search.trim();
      where.OR = [
        { brand: { contains: term, mode: 'insensitive' } },
        { model: { contains: term, mode: 'insensitive' } },
        { plate: { contains: term, mode: 'insensitive' } },
      ];
    }

    const vehicles = await this.prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return vehicles.map((vehicle) => this.serialize(vehicle));
  }

  async findOne(id: string, ownerId: string) {
    const vehicle = await this.findOwnedOrFail(id, ownerId);
    return this.serialize(vehicle);
  }

  async update(id: string, dto: UpdateVehicleDto, ownerId: string) {
    await this.findOwnedOrFail(id, ownerId);

    if (dto.plate) {
      const existing = await this.prisma.vehicle.findFirst({
        where: { plate: dto.plate, NOT: { id } },
      });

      if (existing) {
        throw new ConflictException('Já existe um veículo com esta placa');
      }
    }

    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(dto.brand !== undefined && { brand: dto.brand }),
        ...(dto.model !== undefined && { model: dto.model }),
        ...(dto.year !== undefined && { year: dto.year }),
        ...(dto.plate !== undefined && { plate: dto.plate }),
        ...(dto.purchasePrice !== undefined && {
          purchasePrice: dto.purchasePrice,
        }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.observations !== undefined && {
          observations: dto.observations,
        }),
      },
    });

    return this.serialize(vehicle);
  }

  async remove(id: string, ownerId: string) {
    await this.findOwnedOrFail(id, ownerId);
    await this.prisma.vehicle.delete({ where: { id } });
  }

  async sell(id: string, dto: SellVehicleDto, ownerId: string) {
    const vehicle = await this.findOwnedOrFail(id, ownerId);

    if (vehicle.status === VehicleStatus.SOLD) {
      throw new BadRequestException('Veículo já está vendido');
    }

    const soldAt = dto.soldAt ? new Date(dto.soldAt) : new Date();
    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: {
        status: VehicleStatus.SOLD,
        salePrice: dto.salePrice,
        soldAt,
        saleNotes: dto.saleNotes ?? null,
      },
    });

    return {
      ...this.serialize(updated),
      soldAt: soldAt.toISOString(),
    };
  }
}
