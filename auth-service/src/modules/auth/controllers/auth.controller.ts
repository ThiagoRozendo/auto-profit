import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthService, type SafeUser } from '../services/auth.service';
import {
  AuthApiTags,
  GetMeAuthApiDocs,
  LoginAuthApiDocs,
  RegisterAuthApiDocs,
} from '../swagger';

@AuthApiTags()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @RegisterAuthApiDocs()
  register(@Body() dto: RegisterDto): Promise<SafeUser> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @LoginAuthApiDocs()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @GetMeAuthApiDocs()
  getMe(@Req() req: Request): Promise<SafeUser> {
    const user = req.user as { sub: string };
    return this.authService.getMe(user.sub);
  }
}
