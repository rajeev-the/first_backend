import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface HttpExceptionBody {
  message?: string | string[];
  error?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] | object = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        error = exception.name;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as HttpExceptionBody;
        message = resObj.message ?? exception.message;
        error = resObj.error ?? exception.name;
      }

      if (statusCode === HttpStatus.BAD_REQUEST) {
        this.logger.warn(
          `[400 Bad Request] ${request.method} ${request.url} - Error: ${JSON.stringify(message)} - Body: ${JSON.stringify(request.body)}`,
        );
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      this.logger.error(
        `Unhandled Exception: ${exception.message}`,
        exception.stack,
      );
    }

    const responsePayload = {
      success: false,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error,
    };

    response.status(statusCode).json(responsePayload);
  }
}
