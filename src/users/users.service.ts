import { ForbiddenException, Injectable } from '@nestjs/common';
import { User, UserModel } from './models/users.model';
import { CreateUserDto } from './dtos/create-user.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UserToken, UserTokenModel } from './models/users-tokens.model';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private usersModel: UserModel,
    @InjectModel(UserToken.name) private usersTokensModel: UserTokenModel,
    private readonly jwtService: JwtService,
  ) {}

  async generateUserTokens(userId: string, save = false) {
    const accessToken = this.jwtService.sign(
      { id: userId },
      {
        expiresIn: '1h',
        secret: process.env.JWT_ACCESS_SECRET,
      },
    );
    const refreshToken = this.jwtService.sign(
      { id: userId },
      {
        expiresIn: '1d',
        secret: process.env.JWT_REFRESH_SECRET,
      },
    );
    if (save) {
      const userToken = await this.usersTokensModel.findOne({
        userId,
      });
      if (!userToken) {
        await this.usersTokensModel.create({
          userId,
          refreshToken,
        });
      } else {
        userToken.refreshToken = refreshToken;
        await userToken.save();
      }
    }
    return { accessToken, refreshToken };
  }

  async createUser({ login, username, password }: CreateUserDto) {
    const hashedPassword = await argon2.hash(password);
    return this.usersModel.create({
      login,
      password: hashedPassword,
      username: username ?? login, // TODO: create method that generate random username
    });
  }

  async findUserByQuery(where: FilterQuery<User>) {
    return this.usersModel.findOne(where);
  }

  async findUserById(id: string) {
    return this.usersModel.findById(id);
  }

  async findUserToken(where: FilterQuery<UserToken>) {
    return this.usersTokensModel.findOne(where);
  }

  async validateRefreshToken(token: string) {
    if (!token) {
      throw new ForbiddenException();
    }
    try {
      await this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
        maxAge: '1d',
      });
    } catch (e) {
      throw new ForbiddenException();
    }
    const { id } = (await this.jwtService.decode(token, {
      json: true,
    })!) as Record<string, string>;
    if (!(await this.usersModel.findById(id))) {
      throw new ForbiddenException();
    }
    return true;
  }
}
