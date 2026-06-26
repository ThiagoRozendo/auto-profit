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
import { VehicleStatus } from '../../../generated/prisma/client';
import {
  InternalUser,
  InternalUser as IUser,
} from '../../../common/decorators/internal-user.decorator';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { SellVehicleDto } from '../dto/sell-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { VehiclesService } from '../services/vehicles.service';
import {
  CreateVehicleApiDocs,
  DeleteVehicleApiDocs,
  GetVehicleByIdApiDocs,
  ListVehiclesApiDocs,
  SellVehicleApiDocs,
  UpdateVehicleApiDocs,
  VehiclesApiTags,
} from '../swagger';

@VehiclesApiTags()
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @CreateVehicleApiDocs()
  create(
    @Body() dto: CreateVehicleDto,
    @InternalUser() user: IUser,
  ) {
    return this.vehiclesService.create(dto, user.id);
  }

  @Get()
  @ListVehiclesApiDocs()
  findAll(
    @InternalUser() user: IUser,
    @Query('status') status?: VehicleStatus,
    @Query('search') search?: string,
  ) {
    return this.vehiclesService.findAll(user.id, { status, search });
  }

  @Get(':id')
  @GetVehicleByIdApiDocs()
  findOne(@Param('id') id: string, @InternalUser() user: IUser) {
    return this.vehiclesService.findOne(id, user.id);
  }

  @Patch(':id')
  @UpdateVehicleApiDocs()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
    @InternalUser() user: IUser,
  ) {
    return this.vehiclesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteVehicleApiDocs()
  async remove(@Param('id') id: string, @InternalUser() user: IUser) {
    await this.vehiclesService.remove(id, user.id);
  }

  @Patch(':id/sell')
  @SellVehicleApiDocs()
  sell(
    @Param('id') id: string,
    @Body() dto: SellVehicleDto,
    @InternalUser() user: IUser,
  ) {
    return this.vehiclesService.sell(id, dto, user.id);
  }
}
