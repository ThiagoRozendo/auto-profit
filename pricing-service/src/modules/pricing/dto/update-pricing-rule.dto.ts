import { IsNumber, Min } from 'class-validator';

export class UpdatePricingRuleDto {
  @IsNumber({}, { message: 'A margem padrão deve ser um número' })
  @Min(0, { message: 'A margem padrão não pode ser negativa' })
  defaultProfitMargin: number;
}
