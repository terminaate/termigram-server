import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  private refreshMaxAge = 86400000;

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() authDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { response, refreshToken } = await this.authService.login(authDto);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: this.refreshMaxAge,
      secure: true,
    });
    res.json(response);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() authDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { response, refreshToken } = await this.authService.register(authDto);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: this.refreshMaxAge,
      secure: true,
    });
    res.json(response);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken } = req.cookies;
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(refreshToken);
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: this.refreshMaxAge,
      secure: true,
    });
    res.json({ accessToken: newAccessToken });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { refreshToken } = req.cookies;
    await this.usersService.validateRefreshToken(refreshToken);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      maxAge: this.refreshMaxAge,
      secure: true,
    });
    res.json({ status: 200 });
  }
}
