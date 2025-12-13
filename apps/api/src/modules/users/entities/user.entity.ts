import type { WithOptional } from '@/shared/core/default.entity';
import { UserRole } from '@/shared/types/user-role.enum';
import { randomUUID } from 'crypto';

/**
 * User entity representing a user in the HealthSync platform.
 *
 * @remarks
 * Users are always associated with a clinic. The role determines
 * their permissions within the clinic (admin vs regular user).
 *
 * @example
 * ```typescript
 * const user = new User({
 *   email: 'john@example.com',
 *   name: 'John Doe',
 *   password: 'hashedPassword',
 *   clinicId: 'clinic-uuid',
 * });
 * ```
 */
export class User {
  /** Unique identifier for the user (UUID) */
  id: string;

  /** User's email address (unique across the system) */
  email: string;

  /** Reference to the clinic the user belongs to */
  clinicId: string;

  /** User's display name */
  name: string;

  /** Hashed password (null for OAuth users) */
  password: string | null;

  /** User's role determining permissions */
  role: UserRole;

  /** Whether the user has verified their email address */
  emailVerified: boolean;

  /** Timestamp when the user was created */
  createdAt: Date;

  /** Timestamp when the user was last updated */
  updatedAt: Date;

  /** Timestamp when the user was soft-deleted, null if active */
  deletedAt: Date | null;

  /**
   * Creates a new User instance.
   *
   * @param data - The user data with optional fields for defaults
   */
  constructor(
    data: WithOptional<
      User,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'role' | 'emailVerified'
    >,
  ) {
    Object.assign(this, {
      ...data,
      id: data.id ? data.id : randomUUID(),
      role: data.role || 'USER',
      emailVerified: data.emailVerified || false,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }
}
