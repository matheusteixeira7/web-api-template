import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { prisma } from '@workspace/database';

/**
 * PrismaService - Injectable wrapper for Prisma Client
 *
 * This service provides a NestJS-compatible wrapper around the Prisma client,
 * enabling dependency injection and proper lifecycle management.
 *
 * Usage in other services:
 * @Injectable()
 * export class SomeRepository {
 *   constructor(private readonly prisma: PrismaService) {}
 *
 *   async findUser(id: string) {
 *     return this.prisma.client.user.findUnique({ where: { id } });
 *   }
 * }
 *
 * Benefits:
 * - Centralized Prisma access (no direct imports of `prisma` global)
 * - Proper connection lifecycle (connect on init, disconnect on destroy)
 * - Testability (easy to mock in unit tests)
 * - Dependency injection (follows NestJS patterns)
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  /**
   * Prisma client instance
   *
   * Use `this.prisma.client` to access Prisma operations:
   * - this.prisma.client.user.findMany()
   * - this.prisma.client.$transaction(...)
   * - this.prisma.client.$queryRaw(...)
   */
  public readonly client = prisma;

  /**
   * Connect to database on module initialization
   */
  async onModuleInit() {
    await this.client.$connect();
  }

  /**
   * Disconnect from database on module destruction
   */
  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
