import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

export const GEO_CHECK_KEY = 'geo_check';

/**
 * Apply @GeoRestricted() decorator to any controller or route handler
 * to block requests from restricted countries.
 *
 * Country detection relies on headers set by the reverse proxy / CDN:
 *   - CF-IPCountry (Cloudflare)
 *   - X-Country-Code (custom proxy)
 *   - X-Vercel-IP-Country (Vercel)
 *
 * If no country header is present, the request is allowed through
 * (fail-open for development / missing CDN configuration).
 */
@Injectable()
export class GeoRestrictionGuard implements CanActivate {
  private readonly logger = new Logger(GeoRestrictionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireCheck = this.reflector.getAllAndOverride<boolean>(GEO_CHECK_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireCheck) return true;

    const request = context.switchToHttp().getRequest();
    const countryCode = this.extractCountryCode(request);

    if (!countryCode) {
      // No country header — fail open (log for monitoring)
      this.logger.debug('No country code header detected — skipping geo check');
      return true;
    }

    const restriction = await this.prisma.geoRestriction.findUnique({
      where: { countryCode: countryCode.toUpperCase() },
    });

    if (restriction?.isActive && restriction.type === 'BLOCKED') {
      this.logger.warn(`Blocked request from restricted country: ${countryCode}`);
      throw new ForbiddenException({
        message: 'This service is not available in your region.',
        countryCode,
        reason: restriction.reason || 'Regulatory restrictions apply in your jurisdiction.',
      });
    }

    return true;
  }

  private extractCountryCode(request: any): string | null {
    return (
      request.headers['cf-ipcountry'] ||
      request.headers['x-country-code'] ||
      request.headers['x-vercel-ip-country'] ||
      null
    );
  }
}
