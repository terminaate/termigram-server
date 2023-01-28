import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import * as argon2 from 'argon2';
import { FilterQuery } from 'mongoose';
import { User, UserModel } from './models/users.model';
import { UserToken, UserTokenModel } from './models/users-tokens.model';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private usersModel: UserModel,
    @InjectModel(UserToken.name) private usersTokensModel: UserTokenModel,
    private readonly jwtService: JwtService,
  ) {}

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

  async findUserTokenByQuery(where: FilterQuery<UserToken>) {
    return this.usersTokensModel.findOne(where);
  }

  async findUserTokenById(id: string) {
    return this.usersTokensModel.findById(id);
  }

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
      // TODO
      // add maximum count of sessions
      await this.usersTokensModel.create({
        userId,
        refreshToken,
      });
    }
    return { accessToken, refreshToken };
  }
}
