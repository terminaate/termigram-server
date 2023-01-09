import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  login: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  password: string;
}
