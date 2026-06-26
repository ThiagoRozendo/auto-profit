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
import type { JwtPayload } from '../../../common/auth/jwt-payload.interface';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { buildInternalUserHeaders } from '../../../common/http/internal-user-headers';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { ListVehiclesQueryDto } from '../dto/list-vehicles-query.dto';
import { SellVehicleDto } from '../dto/sell-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import {
  CreateVehicleApiDocs,
  DeleteVehicleApiDocs,
  GetVehicleByIdApiDocs,
  ListVehiclesApiDocs,
  SellVehicleApiDocs,
  UpdateVehicleApiDocs,
  VehiclesApiTags,
} from '../swagger';
import {
  type VehicleResponse,
  VehiclesProxyService,
} from '../services/vehicles-proxy.service';

@VehiclesApiTags()
@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class VehiclesProxyController {
  constructor(private readonly vehiclesProxyService: VehiclesProxyService) {}

  @Post()
  @CreateVehicleApiDocs()
  create(
    @Body() dto: CreateVehicleDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<VehicleResponse> {
    return this.vehiclesProxyService.create(dto, buildInternalUserHeaders(user));
  }

  @Get()
  @ListVehiclesApiDocs()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListVehiclesQueryDto,
  ): Promise<VehicleResponse[]> {
    return this.vehiclesProxyService.findAll(
      buildInternalUserHeaders(user),
      query,
    );
  }

  @Get(':id')
  @GetVehicleByIdApiDocs()
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<VehicleResponse> {
    return this.vehiclesProxyService.findOne(id, buildInternalUserHeaders(user));
  }

  @Patch(':id')
  @UpdateVehicleApiDocs()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<VehicleResponse> {
    return this.vehiclesProxyService.update(
      id,
      dto,
      buildInternalUserHeaders(user),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteVehicleApiDocs()
  remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.vehiclesProxyService.remove(id, buildInternalUserHeaders(user));
  }

  @Patch(':id/sell')
  @SellVehicleApiDocs()
  sell(
    @Param('id') id: string,
    @Body() dto: SellVehicleDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<VehicleResponse> {
    return this.vehiclesProxyService.sell(
      id,
      dto,
      buildInternalUserHeaders(user),
    );
  }
}
