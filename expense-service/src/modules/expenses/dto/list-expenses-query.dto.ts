import { IsDateString, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { ExpenseCategory } from '../../../generated/prisma/client';

const EXPENSE_CATEGORIES = Object.values(ExpenseCategory);

export class ListExpensesQueryDto {
  @IsOptional()
  @IsUUID('4', { message: 'vehicleId deve ser um UUID válido' })
  vehicleId?: string;

  @IsOptional()
  @IsIn(EXPENSE_CATEGORIES, { message: 'Categoria inválida' })
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
