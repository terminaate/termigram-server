import { UsersService } from './users.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, UserRequest } from '@/auth/guards/jwt-auth.guard';
import { UserDto } from './dtos/user.dto';
import { PatchUserDto } from './dtos/patch-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/@me')
  async getSelfUser(@Req() { user }: UserRequest) {
    return new UserDto(user);
  }

  @Get('/:id')
  async getUserById(@Param('id') userId: string) {
    const user = await this.usersService.getUserById(userId);
    return new UserDto(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/@me')
  async patchSelfUser(
    @Req() { user }: UserRequest,
    @Body() patchUserDto: PatchUserDto,
  ) {
    return this.usersService.patchUser(user, patchUserDto);
  }
}
