import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators';
import { SecurityService } from '../../security/security.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private securityService: SecurityService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const isValid = (await super.canActivate(context)) as boolean;
    if (!isValid) return false;

    // Check if user's tokens were invalidated (post-logout / compromise)
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user?.id && user?.iat) {
      const invalidated = await this.securityService.isTokenInvalidated(user.id, user.iat);
      if (invalidated) {
        throw new UnauthorizedException('Session has been invalidated');
      }
    }

    return true;
  }
}
