import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { InternalHttpService } from '../../common/http/internal-http.service';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { ExpensesProxyController } from './controllers/expenses.controller';
import { ExpensesProxyService } from './services/expenses-proxy.service';

@Module({
  imports: [HttpModule, PassportModule],
  controllers: [ExpensesProxyController],
  providers: [ExpensesProxyService, InternalHttpService, JwtStrategy],
})
export class ExpensesModule {}
