import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PatchUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;
}
