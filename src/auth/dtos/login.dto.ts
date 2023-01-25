import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
