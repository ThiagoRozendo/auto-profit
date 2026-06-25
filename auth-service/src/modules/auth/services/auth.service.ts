import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/users.service';
import type { RegisterDto } from '../dto/register.dto';
import type { LoginDto } from '../dto/login.dto';
import type { User } from '../../../generated/prisma/browser';

export interface AuthPayload {
  accessToken: string;
}

export type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<SafeUser> {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    return this.toSafeUser(user);
  }

  async login(dto: LoginDto): Promise<AuthPayload> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async getMe(userId: string): Promise<SafeUser> {
    const user = await this.usersService.findByIdOrFail(userId);
    return this.toSafeUser(user);
  }

  private toSafeUser(user: User): SafeUser {
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }
}
