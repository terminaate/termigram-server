import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthExceptions } from './auth.exceptions';
import * as argon2 from 'argon2';
import { UserDto } from '../users/dtos/user.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  private createResponseDto(user, accessToken, refreshToken) {
    const response = {
      accessToken,
      user: new UserDto(user),
    };
    return { response, refreshToken };
  }

  async login({ login, password }: LoginDto) {
    const candidate = await this.usersService.findUserByQuery({ login });
    if (!candidate) {
      throw AuthExceptions.WrongAuthData();
    }
    const isPasswordMatched = await argon2.verify(candidate.password, password);
    if (!isPasswordMatched) {
      throw AuthExceptions.WrongAuthData();
    }
    const { accessToken, refreshToken } =
      await this.usersService.generateUserTokens(candidate.id, true);
    return this.createResponseDto(candidate, accessToken, refreshToken);
  }

  async register(authDto: RegisterDto) {
    const candidate = await this.usersService.findUserByQuery({
      login: authDto.login,
    });
    if (candidate) {
      throw AuthExceptions.UserAlreadyExist();
    }
    const newUser = await this.usersService.createUser(authDto);
    const { accessToken, refreshToken } =
      await this.usersService.generateUserTokens(newUser.id, true);
    return this.createResponseDto(candidate, accessToken, refreshToken);
  }

  async refresh(refreshToken: string) {
    await this.usersService.validateRefreshToken(refreshToken);
    const userTokens = await this.usersService.findUserToken({ refreshToken });
    return this.usersService.generateUserTokens(userTokens.userId, true);
  }
}
