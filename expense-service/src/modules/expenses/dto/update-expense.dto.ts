import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseDto } from './create-expense.dto';

/**
 * DTO de atualização de despesa.
 * Todos os campos são opcionais — herdados via PartialType do CreateExpenseDto,
 * mantendo todas as validações class-validator originais.
 */
export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}
