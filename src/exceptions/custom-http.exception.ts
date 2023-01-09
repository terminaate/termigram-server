import { HttpException } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(message: string | string[], status: number) {
    super(
      {
        statusCode: status,
        message: Array.isArray(message) ? [...message] : [message],
      },
      status,
    );
  }
}
