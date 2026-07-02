import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseDto } from './create-expense.dto';

/**
 * DTO de atualização de despesa.
 * Todos os campos são opcionais, herdados via PartialType do CreateExpenseDto,
 * mantendo as validações originais do class-validator.
 */
export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}
