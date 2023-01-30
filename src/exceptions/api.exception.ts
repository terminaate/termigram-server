import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends HttpException {
  constructor(message: string | string[], status: number) {
    super(
      {
        message: Array.isArray(message) ? message : [message],
        status,
      },
      status,
    );
  }

  static ForbiddenException() {
    return this.NewException('Forbidden.', HttpStatus.FORBIDDEN);
  }

  static NewException(message: string | string[], status: number) {
    return new ApiException(message, status);
  }
}
