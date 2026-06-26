import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SellVehicleDto {
  @ApiProperty({
    example: 95000,
    description: 'Preco de venda do veiculo.',
  })
  @IsNumber()
  @Min(0)
  salePrice: number;

  @ApiPropertyOptional({
    example: '2026-06-25T10:00:00.000Z',
    description: 'Data da venda em formato ISO 8601.',
  })
  @IsOptional()
  @IsDateString()
  soldAt?: string;

  @ApiPropertyOptional({
    example: 'Venda a vista.',
    description: 'Observacoes sobre a venda.',
  })
  @IsOptional()
  @IsString()
  saleNotes?: string;
}
