import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { VehicleStatus } from './vehicle-status.enum';

export class UpdateVehicleDto {
  @ApiPropertyOptional({
    example: 'Honda',
    description: 'Marca do veiculo.',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    example: 'Civic',
    description: 'Modelo do veiculo.',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    example: 2020,
    description: 'Ano de fabricacao do veiculo.',
  })
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiPropertyOptional({
    example: 'ABC1D23',
    description: 'Placa unica do veiculo.',
  })
  @IsOptional()
  @IsString()
  plate?: string;

  @ApiPropertyOptional({
    example: 85000,
    description: 'Valor de compra do veiculo.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional({
    enum: VehicleStatus,
    description: 'Status atual do veiculo.',
  })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional({
    example: 'Revisao feita em concessionaria.',
    description: 'Observacoes gerais sobre o veiculo.',
  })
  @IsOptional()
  @IsString()
  observations?: string;
}
