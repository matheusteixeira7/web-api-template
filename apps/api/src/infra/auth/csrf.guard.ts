import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { IS_PUBLIC_KEY } from './public';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Skip CSRF check for public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const method = request.method.toUpperCase();

    // Only check CSRF for mutating methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return true;
    }

    const csrfTokenFromHeader = request.headers['x-csrf-token'] as
      | string
      | undefined;
    const csrfTokenFromCookie = request.cookies?.['csrf_token'];

    if (!csrfTokenFromHeader || !csrfTokenFromCookie) {
      throw new ForbiddenException('CSRF token missing');
    }

    if (csrfTokenFromHeader !== csrfTokenFromCookie) {
      throw new ForbiddenException('CSRF token mismatch');
    }

    return true;
  }
}
