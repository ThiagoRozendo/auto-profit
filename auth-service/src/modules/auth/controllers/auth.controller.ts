import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService, type SafeUser } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Cadastrar um novo usuário' })
  @ApiCreatedResponse({ description: 'Usuário criado com sucesso' })
  @ApiConflictResponse({ description: 'E-mail já está em uso' })
  register(@Body() dto: RegisterDto): Promise<SafeUser> {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiOkResponse({ description: 'Token JWT gerado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar dados do usuário autenticado' })
  @ApiOkResponse({ description: 'Dados do usuário autenticado' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  getMe(@Req() req: Request): Promise<SafeUser> {
    const user = req.user as { sub: string };
    return this.authService.getMe(user.sub);
  }
}
