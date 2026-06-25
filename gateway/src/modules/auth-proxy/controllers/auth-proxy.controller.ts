import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
} from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import {
  AuthProxyService,
  type AuthPayloadResponse,
  type SafeUserResponse,
} from '../services/auth-proxy.service';
import {
  AuthApiTags,
  GetMeAuthApiDocs,
  LoginAuthApiDocs,
  RegisterAuthApiDocs,
} from '../swagger';

@AuthApiTags()
@Controller('auth')
export class AuthProxyController {
  constructor(private readonly authProxyService: AuthProxyService) {}

  @Post('register')
  @RegisterAuthApiDocs()
  register(@Body() dto: RegisterDto): Promise<SafeUserResponse> {
    return this.authProxyService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @LoginAuthApiDocs()
  login(@Body() dto: LoginDto): Promise<AuthPayloadResponse> {
    return this.authProxyService.login(dto);
  }

  @Get('me')
  @GetMeAuthApiDocs()
  getMe(
    @Headers('authorization') authorization?: string,
  ): Promise<SafeUserResponse> {
    return this.authProxyService.getMe(authorization);
  }
}
