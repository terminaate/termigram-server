import { ForbiddenException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ApiExceptions } from '../exceptions/api.exceptions';
import * as argon2 from 'argon2';
import { UserDto } from '../users/dtos/user.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async login({ login, password }: LoginDto) {
    const candidate = await this.usersService.findUserByQuery({ login });
    if (!candidate) {
      throw ApiExceptions.WrongAuthData();
    }
    const isPasswordMatched = await argon2.verify(candidate.password, password);
    if (!isPasswordMatched) {
      throw ApiExceptions.WrongAuthData();
    }
    const { accessToken, refreshToken } =
      await this.usersService.generateUserTokens(candidate.id, true);
    const response = {
      accessToken,
      user: new UserDto(candidate),
    };
    return { response, refreshToken };
  }

  async register(authDto: RegisterDto) {
    const candidate = await this.usersService.findUserByQuery({
      login: authDto.login,
    });
    if (candidate) {
      throw ApiExceptions.UserAlreadyExist();
    }
    const newUser = await this.usersService.createUser(authDto);
    const { accessToken, refreshToken } =
      await this.usersService.generateUserTokens(newUser.id, true);
    const response = {
      accessToken,
      user: new UserDto(newUser),
    };
    return { response, refreshToken };
  }

  async refresh(refreshToken: string) {
    await this.usersService.validateRefreshToken(refreshToken);
    const userTokens = await this.usersService.findUserToken({ refreshToken });
    if (!userTokens) {
      throw new ForbiddenException();
    }
    return await this.usersService.generateUserTokens(userTokens.userId, true);
  }
}
