import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        error = res;
      } else if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, unknown>;
        error = (obj.error as string) || exception.message;
        message = Array.isArray(obj.message) ? obj.message.join('; ') : (obj.message as string);
      }
    } else {
      this.logger.error('Unhandled exception', exception instanceof Error ? exception.stack : exception);
    }

    response.status(status).json({
      success: false,
      error,
      message,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
