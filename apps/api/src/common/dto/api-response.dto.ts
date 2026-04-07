export class ApiResponseDto<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: Record<string, unknown>;

  static ok<T>(data: T, message?: string, meta?: Record<string, unknown>): ApiResponseDto<T> {
    const r = new ApiResponseDto<T>();
    r.success = true;
    r.data = data;
    if (message) r.message = message;
    if (meta) r.meta = meta;
    return r;
  }

  static paginated<T>(items: T[], total: number, page: number, pageSize: number) {
    return ApiResponseDto.ok(items, undefined, {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  }

  static fail(error: string, message?: string): ApiResponseDto {
    const r = new ApiResponseDto();
    r.success = false;
    r.error = error;
    if (message) r.message = message;
    return r;
  }
}
