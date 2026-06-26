import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleDto } from './create-vehicle.dto';

/**
 * DTO de atualização de veículo.
 * Todos os campos são opcionais, herdados via PartialType do CreateVehicleDto,
 * mantendo as validações originais do class-validator.
 */
export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}
