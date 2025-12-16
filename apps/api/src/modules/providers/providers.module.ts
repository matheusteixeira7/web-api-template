import { DatabaseModule } from '@/infra/database/database.module';
import { ProvidersApi } from '@/shared/public-api/interface/providers-api.interface';
import { Module } from '@nestjs/common';
import { ProvidersController } from './controllers/providers.controller';
import { ProvidersFacade } from './public-api/facade/providers.facade';
import { PrismaProvidersRepository } from './repositories/prisma-providers-repository';
import { ProvidersRepository } from './repositories/providers.repository';
import { CreateProviderUseCase } from './use-cases/create-provider.usecase';
import { DeleteProviderUseCase } from './use-cases/delete-provider.usecase';
import { FindProviderByIdUseCase } from './use-cases/find-provider-by-id.usecase';
import { FindProviderByUserIdUseCase } from './use-cases/find-provider-by-user-id.usecase';
import { FindProvidersByClinicUseCase } from './use-cases/find-providers-by-clinic.usecase';
import { UpdateProviderUseCase } from './use-cases/update-provider.usecase';

/**
 * ProvidersModule - Providers domain module.
 *
 * @remarks
 * This module follows Clean Architecture with the Facade Pattern:
 * - Exports ONLY `ProvidersApi` (interface Symbol) as the public API
 * - Uses NestJS DI (no manual factories)
 * - Repositories are internal (not exported)
 * - Use cases are internal (not exported)
 * - Facade delegates to use cases
 *
 * External modules should inject `ProvidersApi` to interact with this module.
 *
 * @example
 * ```typescript
 * // In another module
 * constructor(@Inject(ProvidersApi) private readonly providersApi: ProvidersApi) {}
 * ```
 */
@Module({
  imports: [DatabaseModule],
  controllers: [ProvidersController],
  providers: [
    // Repository binding (internal, used by use cases)
    { provide: ProvidersRepository, useClass: PrismaProvidersRepository },

    // Use cases (internal, used by facade and controllers)
    CreateProviderUseCase,
    FindProviderByIdUseCase,
    FindProvidersByClinicUseCase,
    FindProviderByUserIdUseCase,
    UpdateProviderUseCase,
    DeleteProviderUseCase,

    // Facade binding - uses Symbol token
    ProvidersFacade,
    { provide: ProvidersApi, useExisting: ProvidersFacade },
  ],
  exports: [
    ProvidersApi, // Export interface (Symbol) - public API
  ],
})
export class ProvidersModule {}
