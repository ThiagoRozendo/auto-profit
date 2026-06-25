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
import { VehicleStatus } from '../../../generated/prisma/client';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Honda', description: 'Marca do veículo' })
  @IsNotEmpty({ message: 'A marca é obrigatória' })
  @IsString()
  brand: string;

  @ApiProperty({ example: 'Civic', description: 'Modelo do veículo' })
  @IsNotEmpty({ message: 'O modelo é obrigatório' })
  @IsString()
  model: string;

  @ApiProperty({ example: 2020, description: 'Ano de fabricação' })
  @IsInt({ message: 'O ano deve ser um número inteiro' })
  year: number;

  @ApiProperty({ example: 'ABC1D23', description: 'Placa do veículo (única)' })
  @IsNotEmpty({ message: 'A placa é obrigatória' })
  @IsString()
  plate: string;

  @ApiProperty({ example: 85000, description: 'Valor de compra do veículo (>= 0)' })
  @IsNumber({}, { message: 'O preço de compra deve ser um número' })
  @Min(0, { message: 'O preço de compra não pode ser negativo' })
  purchasePrice: number;

  @ApiPropertyOptional({
    enum: VehicleStatus,
    default: VehicleStatus.AVAILABLE,
    description: 'Status inicial do veículo',
  })
  @IsOptional()
  @IsEnum(VehicleStatus, { message: 'Status inválido' })
  status?: VehicleStatus;

  @ApiPropertyOptional({ example: 'Veículo em bom estado', description: 'Observações gerais' })
  @IsOptional()
  @IsString()
  observations?: string;
}
