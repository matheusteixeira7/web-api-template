/**
 * Available roles for users in the system.
 *
 * @remarks
 * This enum is the single source of truth for user roles.
 * The database layer (Prisma) must mirror these values.
 *
 * @sync packages/database/prisma/schema.prisma - enum UserRole
 * @see user-role.enum.spec.ts - Validation test ensuring sync
 */
export enum UserRole {
  /** Regular staff member (receptionist, etc.) */
  USER = 'USER',

  /** Clinic administrator with full permissions */
  ADMIN = 'ADMIN',
}
