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
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { ListExpensesQueryDto } from '../dto/list-expenses-query.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import {
  CreateExpenseApiDocs,
  DeleteExpenseApiDocs,
  ExpensesApiTags,
  GetExpenseByIdApiDocs,
  GetVehicleExpensesTotalApiDocs,
  ListExpensesApiDocs,
  ListExpensesByVehicleApiDocs,
  UpdateExpenseApiDocs,
} from '../swagger';
import {
  type ExpenseResponse,
  type ExpenseVehicleTotalResponse,
  ExpensesProxyService,
} from '../services/expenses-proxy.service';

@ExpensesApiTags()
@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesProxyController {
  constructor(private readonly expensesProxyService: ExpensesProxyService) {}

  @Post()
  @CreateExpenseApiDocs()
  create(
    @Body() dto: CreateExpenseDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ExpenseResponse> {
    return this.expensesProxyService.create(dto, buildInternalUserHeaders(user));
  }

  @Get()
  @ListExpensesApiDocs()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListExpensesQueryDto,
  ): Promise<ExpenseResponse[]> {
    return this.expensesProxyService.findAll(
      buildInternalUserHeaders(user),
      query,
    );
  }

  @Get('vehicle/:vehicleId/total')
  @GetVehicleExpensesTotalApiDocs()
  getVehicleTotal(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ExpenseVehicleTotalResponse> {
    return this.expensesProxyService.getVehicleTotal(
      vehicleId,
      buildInternalUserHeaders(user),
    );
  }

  @Get('vehicle/:vehicleId')
  @ListExpensesByVehicleApiDocs()
  findByVehicle(
    @Param('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ExpenseResponse[]> {
    return this.expensesProxyService.findByVehicle(
      vehicleId,
      buildInternalUserHeaders(user),
    );
  }

  @Get(':id')
  @GetExpenseByIdApiDocs()
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ExpenseResponse> {
    return this.expensesProxyService.findOne(id, buildInternalUserHeaders(user));
  }

  @Patch(':id')
  @UpdateExpenseApiDocs()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ExpenseResponse> {
    return this.expensesProxyService.update(
      id,
      dto,
      buildInternalUserHeaders(user),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteExpenseApiDocs()
  remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.expensesProxyService.remove(id, buildInternalUserHeaders(user));
  }
}
