import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ExpenseCategory } from '../../../generated/prisma/client';

export class ListExpensesQueryDto {
  @IsOptional()
  @IsUUID('4', { message: 'vehicleId deve ser um UUID válido' })
  vehicleId?: string;

  @IsOptional()
  @IsEnum(ExpenseCategory, { message: 'Categoria inválida' })
  category?: ExpenseCategory;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString({}, { message: 'startDate deve ser uma data ISO 8601 válida' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'endDate deve ser uma data ISO 8601 válida' })
  endDate?: string;
}
