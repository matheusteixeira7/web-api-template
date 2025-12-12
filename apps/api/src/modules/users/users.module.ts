import { DatabaseModule } from '@/infra/database/database.module';
import { UsersApi } from '@/shared/public-api/interface/users-api.interface';
import { Module } from '@nestjs/common';
import { GetCurrentUserController } from './controllers/get-current-user.controller';
import { UsersController } from './controllers/users.controller';
import { UsersFacade } from './public-api/facade/users.facade';
import { PrismaUsersRepository } from './repositories/prisma-users-repository';
import { UsersRepository } from './repositories/users.repository';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { FindUserUseCase } from './use-cases/find-user.usecase';
import { UpdatePasswordUseCase } from './use-cases/update-password.usecase';
import { VerifyEmailUseCase } from './use-cases/verify-email.usecase';

/**
 * UsersModule - Users domain module
 *
 * This module follows Clean Architecture with Facade Pattern:
 * - Exports ONLY UsersApi (interface Symbol) - public API
 * - Uses NestJS DI (no manual factories)
 * - Repositories are internal (not exported)
 * - Use cases are internal (not exported)
 * - Facade delegates to use cases
 */
@Module({
  imports: [DatabaseModule],
  controllers: [UsersController, GetCurrentUserController],
  providers: [
    // Repository binding (internal, used by use cases)
    { provide: UsersRepository, useClass: PrismaUsersRepository },

    // Use cases (internal, used by facade)
    FindUserUseCase,
    CreateUserUseCase,
    VerifyEmailUseCase,
    UpdatePasswordUseCase,

    // Facade binding - uses Symbol token
    UsersFacade,
    { provide: UsersApi, useExisting: UsersFacade },
  ],
  exports: [
    UsersApi, // ✅ Export interface (Symbol) - public API
    // UsersFacade,  // ❌ Don't export concrete class
    // UsersRepository, ❌ NEVER export repositories
    // Use cases,    // ❌ Use cases are internal implementation details
  ],
})
export class UsersModule {}
