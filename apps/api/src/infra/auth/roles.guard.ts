import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { UserRole } from '@/shared/types/user-role.enum';
import { ROLES_KEY } from './roles.decorator';
import type { UserPayload } from './jwt.strategy';

/**
 * Guard that checks if the authenticated user has the required role(s).
 *
 * @remarks
 * Works in conjunction with the @Roles decorator.
 * If no roles are specified, access is allowed.
 * If roles are specified, the user must have at least one of the required roles.
 *
 * @throws {ForbiddenException} If user lacks required role
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /** @inheritdoc */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { user: UserPayload }>();

    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
