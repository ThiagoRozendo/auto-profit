import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { VehicleStatus } from '../../../generated/prisma/client';
import {
  InternalUser,
  InternalUser as IUser,
} from '../../../common/decorators/internal-user.decorator';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { SellVehicleDto } from '../dto/sell-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { VehiclesService } from '../services/vehicles.service';

const X_USER_ID_HEADER = {
  name: 'x-user-id',
  required: true,
  description:
    'UUID do usuário autenticado. Enviado automaticamente pelo API Gateway. ' +
    'Necessário para testes diretos neste serviço.',
  schema: {
    type: 'string',
    format: 'uuid',
    example: '11111111-1111-1111-1111-111111111111',
  },
};

@ApiTags('Vehicles')
@ApiHeader(X_USER_ID_HEADER)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  // ─── POST /vehicles ─────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Cadastrar veículo', description: 'Cria um novo veículo associado ao usuário autenticado.' })
  @ApiOkResponse({ description: 'Veículo criado com sucesso.' })
  create(
    @Body() dto: CreateVehicleDto,
    @InternalUser() user: IUser,
  ) {
    return this.vehiclesService.create(dto, user.id);
  }

  // ─── GET /vehicles ───────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'Listar veículos',
    description:
      'Retorna todos os veículos do usuário autenticado. ' +
      'Suporta filtros opcionais por status e texto de busca (marca, modelo, placa).',
  })
  @ApiOkResponse({ description: 'Lista de veículos retornada com sucesso.' })
  @ApiQuery({ name: 'status', required: false, enum: VehicleStatus, description: 'Filtrar por status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por marca, modelo ou placa' })
  findAll(
    @InternalUser() user: IUser,
    @Query('status') status?: VehicleStatus,
    @Query('search') search?: string,
  ) {
    return this.vehiclesService.findAll(user.id, { status, search });
  }

  // ─── GET /vehicles/:id ───────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar veículo por ID',
    description: 'Retorna os detalhes de um veículo. Só retorna veículos pertencentes ao usuário autenticado.',
  })
  @ApiOkResponse({ description: 'Veículo encontrado.' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID do veículo' })
  findOne(@Param('id') id: string, @InternalUser() user: IUser) {
    return this.vehiclesService.findOne(id, user.id);
  }

  // ─── PATCH /vehicles/:id ─────────────────────────────────────────────────────

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar veículo',
    description: 'Atualiza campos do veículo. Só permite atualizar veículos do usuário autenticado.',
  })
  @ApiOkResponse({ description: 'Veículo atualizado com sucesso.' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID do veículo' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
    @InternalUser() user: IUser,
  ) {
    return this.vehiclesService.update(id, dto, user.id);
  }

  // ─── DELETE /vehicles/:id ────────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir veículo',
    description: 'Remove um veículo. Só permite excluir veículos pertencentes ao usuário autenticado.',
  })
  @ApiNoContentResponse({ description: 'Veículo excluído com sucesso.' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID do veículo' })
  async remove(@Param('id') id: string, @InternalUser() user: IUser) {
    await this.vehiclesService.remove(id, user.id);
  }

  // ─── PATCH /vehicles/:id/sell ────────────────────────────────────────────────

  @Patch(':id/sell')
  @ApiOperation({
    summary: 'Registrar venda de veículo',
    description:
      'Marca o veículo como SOLD, registra o preço de venda e a data. ' +
      'Retorna erro se o veículo já estiver vendido.',
  })
  @ApiOkResponse({ description: 'Veículo marcado como vendido com sucesso.' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID do veículo' })
  sell(
    @Param('id') id: string,
    @Body() dto: SellVehicleDto,
    @InternalUser() user: IUser,
  ) {
    return this.vehiclesService.sell(id, dto, user.id);
  }
}
