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
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDto } from '../users/dtos/user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  refreshMaxAge = 86400000;

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiResponse({
    status: 200,
    description: 'The user has successfully logged into their account',
    content: {
      response: {
        example: {
          accessToken: 'my-secret-token',
          user: new UserDto({ id: 1, username: 'terminaate' }),
        },
      },
    },
  })
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

  @ApiResponse({
    status: 200,
    description: 'The user has successfully logged into their account',
    content: {
      response: {
        example: {
          accessToken: 'my-secret-token',
          user: new UserDto({ id: 1, username: 'terminaate' }),
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The user has successfully register a new account',
    content: {
      response: {
        example: {
          accessToken: 'my-secret-token',
          user: new UserDto({ id: 1, username: 'terminaate' }),
        },
      },
    },
  })
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

  @ApiResponse({
    status: 200,
    description: 'The user has successfully refresh his auth tokens',
    content: {
      response: {
        example: {
          accessToken: 'my-secret-token',
        },
      },
    },
  })
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

  @ApiResponse({
    status: 200,
    description:
      'The user has successfully logout from his account (removing http only cookies)',
    content: {
      response: {
        example: {
          accessToken: 'my-secret-token',
          user: new UserDto({ id: 1, username: 'terminaate' }),
        },
      },
    },
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { refreshToken } = req.cookies;
    await this.authService.validateRefreshToken(refreshToken);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      maxAge: this.refreshMaxAge,
      secure: true,
    });
    res.json({ status: 200 });
  }
}
