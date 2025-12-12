import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * DatabaseModule - Global module for database access
 *
 * This module provides centralized database access via PrismaService.
 * It's marked as @Global() so it doesn't need to be imported in every module.
 *
 * Usage:
 * 1. Import DatabaseModule in AppModule (once)
 * 2. Inject PrismaService anywhere in the app:
 *
 * @Injectable()
 * export class UserRepository {
 *   constructor(private readonly prisma: PrismaService) {}
 * }
 *
 * Benefits:
 * - Single source of truth for database connection
 * - Proper lifecycle management (connect/disconnect)
 * - Easy to mock in tests
 * - Follows NestJS best practices
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
