import { UserRole as PrismaUserRole } from '@workspace/database';
import { UserRole } from './user-role.enum';

/**
 * This test ensures the application's UserRole enum stays in sync
 * with Prisma's UserRole enum in the database schema.
 *
 * If this test fails, update one of:
 * - apps/api/src/shared/types/user-role.enum.ts (application)
 * - packages/database/prisma/schema.prisma (database)
 */
describe('UserRole enum sync', () => {
  it('should have the same values as Prisma UserRole', () => {
    const appValues = Object.values(UserRole).sort();
    const prismaValues = Object.values(PrismaUserRole).sort();

    expect(appValues).toEqual(prismaValues);
  });

  it('should have the same keys as Prisma UserRole', () => {
    const appKeys = Object.keys(UserRole).sort();
    const prismaKeys = Object.keys(PrismaUserRole).sort();

    expect(appKeys).toEqual(prismaKeys);
  });
});
