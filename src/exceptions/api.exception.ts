import { HttpException } from '@nestjs/common';

export class ApiException extends HttpException {
  constructor(message: string | string[], status: number) {
    super(
      {
        message,
      },
      status,
    );
  }

  static NewException(message: string | string[], status: number) {
    return new ApiException(message, status);
  }
}
