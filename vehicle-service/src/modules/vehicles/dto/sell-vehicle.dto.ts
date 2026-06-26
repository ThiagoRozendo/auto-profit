import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SellVehicleDto {
  @ApiProperty({ example: 95000, description: 'Preço de venda do veículo (>= 0)' })
  @IsNumber({}, { message: 'O preço de venda deve ser um número' })
  @Min(0, { message: 'O preço de venda não pode ser negativo' })
  salePrice: number;

  @ApiPropertyOptional({
    example: '2026-06-25T10:00:00.000Z',
    description: 'Data da venda. Se não informado, usa a data atual.',
  })
  @IsOptional()
  @IsDateString({}, { message: 'A data deve ser uma string ISO 8601 válida' })
  soldAt?: string;

  @ApiPropertyOptional({
    example: 'Venda à vista',
    description: 'Observações sobre a venda',
  })
  @IsOptional()
  @IsString()
  saleNotes?: string;
}
