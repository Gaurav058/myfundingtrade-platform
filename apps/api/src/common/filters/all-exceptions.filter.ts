import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

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
      // Unhandled exception — log full stack, return only generic message
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
      if (this.isProduction) {
        error = 'Internal Server Error';
        message = 'An unexpected error occurred';
      }
    }

    response.status(status).json({
      success: false,
      error,
      ...(message && { message }),
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
