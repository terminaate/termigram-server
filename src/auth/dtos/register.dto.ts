import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'terminaate',
    description: 'The login of user account',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  login: string;

  @ApiProperty({
    example: 'termi',
    description: 'The public username of user profile',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @ApiProperty({
    example: '12345678',
    description: 'The password of user account',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  password: string;
}
