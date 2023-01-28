import { Injectable } from '@nestjs/common';
import { UserDocument } from './models/users.model';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { UsersExceptions } from './users.exceptions';
import { PatchUserDto } from './dtos/patch-user.dto';
import { UserDto } from './dtos/user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async getUserById(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw UsersExceptions.UserIdIsNotValid();
    }
    const user = await this.usersRepository.findUserById(userId);
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
}
