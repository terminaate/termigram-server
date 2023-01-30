import { Injectable } from '@nestjs/common';
import { AuthExceptions } from './auth.exceptions';
import * as argon2 from 'argon2';
import { UserDto } from '@/users/dtos/user.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { UsersRepository } from '@/users/users.repository';
import { Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ApiException } from '@/exceptions/api.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async login({ login, password }: LoginDto) {
    const candidate = await this.usersRepository.findUserByQuery({ login });
    if (!candidate) {
      throw AuthExceptions.WrongAuthData();
    }
    const isPasswordMatched = await argon2.verify(candidate.password, password);
    if (!isPasswordMatched) {
      throw AuthExceptions.WrongAuthData();
    }
    const { accessToken, refreshToken } =
      await this.usersRepository.generateUserTokens(candidate.id, true);
    return this.createResponseDto(candidate, accessToken, refreshToken);
  }

  async register(authDto: RegisterDto) {
    const candidate = await this.usersRepository.findUserByQuery({
      login: authDto.login,
    });
    if (candidate) {
      throw AuthExceptions.UserAlreadyExist();
    }
    const newUser = await this.usersRepository.createUser(authDto);
    const { accessToken, refreshToken } =
      await this.usersRepository.generateUserTokens(newUser.id, true);
    return this.createResponseDto(candidate, accessToken, refreshToken);
  }

  async validateRefreshToken(token: string) {
    if (!token) {
      throw ApiException.ForbiddenException();
    }
    try {
      await this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
        maxAge: '1d',
      });
    } catch (e) {
      throw ApiException.ForbiddenException();
    }
    const { id } = (await this.jwtService.decode(token, {
      json: true,
    })!) as Record<string, string>;
    if (
      !Types.ObjectId.isValid(id) ||
      !(await this.usersRepository.findUserTokenById(id))
    ) {
      throw ApiException.ForbiddenException();
    }
    return this.usersRepository.findUserTokenByQuery({ refreshToken: token });
  }

  async refresh(refreshToken: string) {
    await this.validateRefreshToken(refreshToken);
    const userTokens = await this.usersRepository.findUserTokenByQuery({
      refreshToken,
    });
    return this.usersRepository.generateUserTokens(userTokens.userId, true);
  }

  private createResponseDto(user, accessToken, refreshToken) {
    const response = {
      accessToken,
      user: new UserDto(user),
    };
    return { response, refreshToken };
  }
}
