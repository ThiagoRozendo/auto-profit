import { IsBoolean, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CalculatePricingDto {
  @IsUUID('4', { message: 'vehicleId deve ser um UUID válido' })
  vehicleId: string;

  @IsOptional()
  @IsNumber({}, { message: 'A margem de lucro deve ser um número' })
  @Min(0, { message: 'A margem de lucro não pode ser negativa' })
  profitMargin?: number;

  @IsOptional()
  @IsBoolean({ message: 'saveHistory deve ser um booleano' })
  saveHistory?: boolean;
}
