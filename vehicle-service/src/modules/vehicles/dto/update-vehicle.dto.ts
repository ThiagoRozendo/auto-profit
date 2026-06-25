import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleDto } from './create-vehicle.dto';

/**
 * DTO de atualização de veículo.
 * Todos os campos são opcionais — herdados via PartialType do CreateVehicleDto,
 * mantendo todas as validações class-validator originais.
 */
export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}
