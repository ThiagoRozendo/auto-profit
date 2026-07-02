import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ExpenseCategory } from '../../../generated/prisma/client';

const EXPENSE_CATEGORIES = Object.values(ExpenseCategory);

export class CreateExpenseDto {
  @IsUUID('4', { message: 'vehicleId deve ser um UUID válido' })
  vehicleId: string;

  @IsOptional()
  @IsString()
  vehicleLabel?: string;

  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  @IsString()
  description: string;

  @IsOptional()
  @IsIn(EXPENSE_CATEGORIES, { message: 'Categoria inválida' })
  category?: ExpenseCategory;

  @IsNumber({}, { message: 'O valor deve ser um número' })
  @Min(0, { message: 'O valor não pode ser negativo' })
  amount: number;

  @IsOptional()
  @IsDateString({}, { message: 'expenseDate deve ser uma data ISO 8601 válida' })
  expenseDate?: string;
}
