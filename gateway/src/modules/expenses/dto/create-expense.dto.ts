import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ExpenseCategory } from './expense-category.enum';

export class CreateExpenseDto {
  @ApiProperty({
    example: '22222222-2222-4222-8222-222222222222',
    description: 'Identificador do veículo associado à despesa.',
  })
  @IsUUID('4')
  vehicleId: string;

  @ApiPropertyOptional({
    example: 'Honda Civic 2020',
    description: 'Rótulo descritivo do veículo para exibição.',
  })
  @IsOptional()
  @IsString()
  vehicleLabel?: string;

  @ApiProperty({
    example: 'Troca de pneus',
    description: 'Descrição da despesa.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    enum: ExpenseCategory,
    default: ExpenseCategory.OTHER,
    description: 'Categoria da despesa.',
  })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @ApiProperty({
    example: 1800,
    description: 'Valor da despesa.',
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    example: '2026-06-25T10:00:00.000Z',
    description: 'Data da despesa em formato ISO 8601.',
  })
  @IsOptional()
  @IsDateString()
  expenseDate?: string;
}
