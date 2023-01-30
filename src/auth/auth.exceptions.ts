import { HttpStatus } from '@nestjs/common';
import { ApiException } from '@/exceptions/api.exception';

export class AuthExceptions extends ApiException {
  static UserAlreadyExist() {
    return super.NewException(
      'User with this login already exist.',
      HttpStatus.BAD_REQUEST,
    );
  }

  static UserNotExist() {
    return super.NewException(
      'User with this id not exist.',
      HttpStatus.NOT_FOUND,
    );
  }

  static WrongAuthData() {
    return super.NewException(
      'Wrong login or password.',
      HttpStatus.BAD_REQUEST,
    );
  }
}
