import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { InternalHttpService } from '../../common/http/internal-http.service';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { VehiclesProxyController } from './vehicles.controller';
import { VehiclesProxyService } from './services/vehicles-proxy.service';

@Module({
  imports: [HttpModule, PassportModule],
  controllers: [VehiclesProxyController],
  providers: [VehiclesProxyService, InternalHttpService, JwtStrategy],
})
export class VehiclesModule {}
