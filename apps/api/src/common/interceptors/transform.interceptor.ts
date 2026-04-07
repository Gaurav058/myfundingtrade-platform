import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof ApiResponseDto) return data;
        return ApiResponseDto.ok(data);
      }),
    );
  }
}
