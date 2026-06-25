import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Joao Silva',
    description: 'Nome do usuario a ser cadastrado.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'joao@example.com',
    description: 'E-mail unico do usuario.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha com no minimo 6 caracteres.',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
