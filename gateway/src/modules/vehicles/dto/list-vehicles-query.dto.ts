import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VehicleStatus } from './vehicle-status.enum';

export class ListVehiclesQueryDto {
  @ApiPropertyOptional({
    enum: VehicleStatus,
    description: 'Filtrar por status do veiculo.',
  })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional({
    example: 'Civic',
    description: 'Texto para buscar por marca, modelo ou placa.',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
