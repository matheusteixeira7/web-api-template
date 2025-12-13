import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@/shared/types/user-role.enum';

/** Metadata key for storing required roles */
export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for accessing an endpoint.
 *
 * @param roles - The roles allowed to access the endpoint
 * @example
 * ```typescript
 * @Roles('ADMIN')
 * @Get('/admin-only')
 * adminEndpoint() {}
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
