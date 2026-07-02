import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { VehicleStatus } from './vehicle-status.enum';

export class CreateVehicleDto {
  @ApiProperty({
    example: 'Honda',
    description: 'Marca do veiculo.',
  })
  @IsNotEmpty()
  @IsString()
  brand: string;

  @ApiProperty({
    example: 'Civic',
    description: 'Modelo do veiculo.',
  })
  @IsNotEmpty()
  @IsString()
  model: string;

  @ApiProperty({
    example: 2020,
    description: 'Ano de fabricacao do veiculo.',
  })
  @IsInt()
  year: number;

  @ApiProperty({
    example: 'ABC1D23',
    description: 'Placa unica do veiculo.',
  })
  @IsNotEmpty()
  @IsString()
  plate: string;

  @ApiProperty({
    example: 85000,
    description: 'Valor de compra do veiculo.',
  })
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @ApiPropertyOptional({
    enum: VehicleStatus,
    default: VehicleStatus.AVAILABLE,
    description: 'Status inicial do veiculo.',
  })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional({
    example: 'Veiculo em bom estado.',
    description: 'Observacoes gerais sobre o veiculo.',
  })
  @IsOptional()
  @IsString()
  observations?: string;
}
