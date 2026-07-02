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
  InternalUser,
  InternalUser as IUser,
} from '../../../common/decorators/internal-user.decorator';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { ListExpensesQueryDto } from '../dto/list-expenses-query.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { ExpensesService } from '../services/expenses.service';
import {
  CreateExpenseApiDocs,
  DeleteExpenseApiDocs,
  ExpensesApiTags,
  GetExpenseByIdApiDocs,
  GetVehicleExpensesTotalApiDocs,
  ListExpensesByVehicleApiDocs,
  ListExpensesApiDocs,
  UpdateExpenseApiDocs,
} from '../swagger';

@ExpensesApiTags()
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  // ─── GET /expenses/vehicle/:vehicleId/total ──────────────────────────────────
  // IMPORTANTE: rotas estáticas devem vir antes das rotas dinâmicas (:id)
  // para evitar que o NestJS interprete 'vehicle' como um :id.

  @Get('vehicle/:vehicleId/total')
  @GetVehicleExpensesTotalApiDocs()
  getVehicleTotal(
    @Param('vehicleId') vehicleId: string,
    @InternalUser() user: IUser,
  ) {
    return this.expensesService.getVehicleTotal(vehicleId, user.id);
  }

  // ─── GET /expenses/vehicle/:vehicleId ────────────────────────────────────────

  @Get('vehicle/:vehicleId')
  @ListExpensesByVehicleApiDocs()
  findByVehicle(
    @Param('vehicleId') vehicleId: string,
    @InternalUser() user: IUser,
  ) {
    return this.expensesService.findByVehicle(vehicleId, user.id);
  }

  // ─── POST /expenses ──────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CreateExpenseApiDocs()
  create(
    @Body() dto: CreateExpenseDto,
    @InternalUser() user: IUser,
  ) {
    return this.expensesService.create(user.id, dto);
  }

  // ─── GET /expenses ───────────────────────────────────────────────────────────

  @Get()
  @ListExpensesApiDocs()
  findAll(
    @InternalUser() user: IUser,
    @Query() query: ListExpensesQueryDto,
  ) {
    return this.expensesService.findAll(user.id, query);
  }

  // ─── GET /expenses/:id ───────────────────────────────────────────────────────

  @Get(':id')
  @GetExpenseByIdApiDocs()
  findOne(@Param('id') id: string, @InternalUser() user: IUser) {
    return this.expensesService.findOne(id, user.id);
  }

  // ─── PATCH /expenses/:id ─────────────────────────────────────────────────────

  @Patch(':id')
  @UpdateExpenseApiDocs()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @InternalUser() user: IUser,
  ) {
    return this.expensesService.update(id, dto, user.id);
  }

  // ─── DELETE /expenses/:id ────────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteExpenseApiDocs()
  async remove(@Param('id') id: string, @InternalUser() user: IUser) {
    await this.expensesService.remove(id, user.id);
  }
}
