import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { InternalHttpService } from '../../common/http/internal-http.service';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { AuthProxyController } from './controllers/auth-proxy.controller';
import { AuthProxyService } from './services/auth-proxy.service';

@Module({
  imports: [HttpModule, PassportModule],
  controllers: [AuthProxyController],
  providers: [AuthProxyService, InternalHttpService, JwtStrategy],
  exports: [AuthProxyService, InternalHttpService],
})
export class AuthProxyModule {}
