import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar saúde do serviço' })
  @ApiOkResponse({
    description: 'Status do serviço e configuração da infraestrutura.',
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
