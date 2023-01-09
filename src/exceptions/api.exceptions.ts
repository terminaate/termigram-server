import { CustomHttpException } from './custom-http.exception';

export class ApiExceptions extends CustomHttpException {
  constructor(message: string | string[], status: number) {
    super(message, status);
  }

  static UserAlreadyExist() {
    return this.NewException('User with this login already exist.', 400);
  }

  static UserNotExist() {
    return this.NewException('User with this id not exist.', 404);
  }

  static WrongAuthData() {
    return this.NewException('Wrong login or password.', 400);
  }

  static NewException(message: string | string[], status: number) {
    return new ApiExceptions(message, status);
  }
}
