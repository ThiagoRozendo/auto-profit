import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ExpenseCategory } from './expense-category.enum';

export class ListExpensesQueryDto {
  @ApiPropertyOptional({
    example: '22222222-2222-4222-8222-222222222222',
    description: 'Filtrar despesas de um veículo específico.',
  })
  @IsOptional()
  @IsUUID('4')
  vehicleId?: string;

  @ApiPropertyOptional({
    enum: ExpenseCategory,
    description: 'Filtrar por categoria.',
  })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @ApiPropertyOptional({
    example: 'pneus',
    description: 'Buscar por descrição ou rótulo do veículo.',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: '2026-06-01T00:00:00.000Z',
    description: 'Filtrar despesas a partir desta data.',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-06-30T23:59:59.999Z',
    description: 'Filtrar despesas até esta data.',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
