import { ForbiddenException, Injectable } from '@nestjs/common';
import { User, UserDocument, UserModel } from './models/users.model';
import { CreateUserDto } from './dtos/create-user.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UserToken, UserTokenModel } from './models/users-tokens.model';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Types } from 'mongoose';
import { UsersExceptions } from './users.exceptions';
import { PatchUserDto } from './dtos/patch-user.dto';
import { UserDto } from './dtos/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private usersModel: UserModel,
    @InjectModel(UserToken.name) private usersTokensModel: UserTokenModel,
    private readonly jwtService: JwtService,
  ) {}

  async getUserById(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw UsersExceptions.UserIdIsNotValid();
    }
    const user = await this.usersModel.findById(userId);
    if (!user) {
      throw UsersExceptions.UserIsNotExist();
    }
    return user;
  }

  async patchUser(user: UserDocument, patchUserDto: PatchUserDto) {
    for (const key in patchUserDto) {
      if (user.get(key)) {
        user.set(key, patchUserDto[key]);
      }
    }
    await user.save();
    return new UserDto(user);
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
    if (!Types.ObjectId.isValid(id) || !(await this.usersModel.findById(id))) {
      throw new ForbiddenException();
    }
    return this.usersTokensModel.findOne({ refreshToken: token });
  }
}
