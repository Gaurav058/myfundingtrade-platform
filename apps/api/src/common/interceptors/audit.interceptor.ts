import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../../audit/audit.service';

/** Roles whose mutating requests are automatically audit-logged. */
const AUDITED_ROLES = new Set([
  'SUPER_ADMIN',
  'FINANCE_ADMIN',
  'CONTENT_ADMIN',
  'KYC_REVIEWER',
  'SUPPORT_AGENT',
]);

/** Fields that must never appear in audit logs. */
const SENSITIVE_FIELDS = new Set([
  'password',
  'passwordHash',
  'token',
  'refreshToken',
  'accessToken',
  'secret',
  'twoFactorSecret',
  'tokenHash',
  'documentNumber',
  'ssn',
  'taxId',
  'cookieSecret',
]);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method: string = request.method;

    // Only audit mutating requests
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const user = request.user;
    if (!user || !AUDITED_ROLES.has(user.role)) {
      return next.handle();
    }

    const handler = context.getHandler().name;
    const controller = context.getClass().name;

    return next.handle().pipe(
      tap((result) => {
        this.auditService
          .log({
            performerId: user.id,
            action: `${method}:${handler}`,
            resource: controller.replace('Controller', ''),
            resourceId: request.params?.id,
            after: this.sanitize(result),
            ipAddress: request.ip || '0.0.0.0',
            userAgent: request.headers?.['user-agent'],
            metadata: {
              body: this.sanitize(request.body),
              params: request.params,
              query: request.query,
              path: request.url,
            },
          })
          .catch((err: Error) => {
            this.logger.error(`Audit log failed: ${err.message}`);
          });
      }),
    );
  }

  private sanitize(obj: unknown): unknown {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map((item) => this.sanitize(item));

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (SENSITIVE_FIELDS.has(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}
