import { ApiException } from '../exceptions/api.exception';

export class UsersExceptions extends ApiException {
  static UserIdIsNotValid() {
    return super.NewException("User id isn't valid.", 400);
  }

  static UserIsNotExist() {
    return super.NewException("User isn't exist.", 404);
  }
}
