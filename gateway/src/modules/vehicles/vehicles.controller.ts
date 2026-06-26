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
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { buildInternalUserHeaders } from '../../common/http/internal-user-headers';
import type { JwtPayload } from '../../common/auth/jwt-payload.interface';
import { VehiclesProxyService } from './services/vehicles-proxy.service';

@ApiTags('Vehicles')
@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class VehiclesProxyController {
  constructor(private readonly vehiclesProxyService: VehiclesProxyService) {}

  // ─── POST /vehicles ──────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Cadastrar veículo' })
  create(
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.vehiclesProxyService.create(body, buildInternalUserHeaders(user));
  }

  // ─── GET /vehicles ───────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Listar veículos do usuário autenticado' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.vehiclesProxyService.findAll(
      buildInternalUserHeaders(user),
      { status, search },
    );
  }

  // ─── GET /vehicles/:id ───────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Buscar veículo por ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.vehiclesProxyService.findOne(id, buildInternalUserHeaders(user));
  }

  // ─── PATCH /vehicles/:id ─────────────────────────────────────────────────────

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar veículo' })
  @ApiParam({ name: 'id', format: 'uuid' })
  update(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.vehiclesProxyService.update(
      id,
      body,
      buildInternalUserHeaders(user),
    );
  }

  // ─── DELETE /vehicles/:id ────────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir veículo' })
  @ApiParam({ name: 'id', format: 'uuid' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.vehiclesProxyService.remove(id, buildInternalUserHeaders(user));
  }

  // ─── PATCH /vehicles/:id/sell ────────────────────────────────────────────────

  @Patch(':id/sell')
  @ApiOperation({ summary: 'Registrar venda de veículo' })
  @ApiParam({ name: 'id', format: 'uuid' })
  sell(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.vehiclesProxyService.sell(
      id,
      body,
      buildInternalUserHeaders(user),
    );
  }
}
