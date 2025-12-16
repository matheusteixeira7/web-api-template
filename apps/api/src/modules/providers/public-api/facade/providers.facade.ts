import { ProvidersApi } from '@/shared/public-api/interface/providers-api.interface';
import { Injectable } from '@nestjs/common';
import type { FindProvidersPaginatedResponseDto } from '../../dto/find-provider.dto';
import { Provider } from '../../entities/provider.entity';
import type { FindProvidersFilters } from '../../types/provider-filters.types';
import { FindProviderByIdUseCase } from '../../use-cases/find-provider-by-id.usecase';
import { FindProviderByUserIdUseCase } from '../../use-cases/find-provider-by-user-id.usecase';
import { FindProvidersByClinicUseCase } from '../../use-cases/find-providers-by-clinic.usecase';

/**
 * ProvidersFacade - Public API implementation for Providers module.
 *
 * @remarks
 * This facade is a pure DELEGATION layer, not a business logic layer.
 * - Delegates to Use Cases (business logic)
 * - Does NOT call repositories directly
 * - Does NOT contain business rules
 * - Acts as public interface for external modules
 *
 * This is the ONLY way external modules should interact with the Providers module.
 *
 * @example
 * ```typescript
 * const provider = await providersFacade.findById('provider-uuid');
 * ```
 */
@Injectable()
export class ProvidersFacade implements ProvidersApi {
  constructor(
    private readonly findProviderByIdUseCase: FindProviderByIdUseCase,
    private readonly findProvidersByClinicUseCase: FindProvidersByClinicUseCase,
    private readonly findProviderByUserIdUseCase: FindProviderByUserIdUseCase,
  ) {}

  /**
   * Finds a provider by their unique identifier.
   *
   * @param id - The provider's UUID
   * @returns The provider entity if found, null otherwise
   */
  async findById(id: string): Promise<Provider | null> {
    return this.findProviderByIdUseCase.execute(id);
  }

  /**
   * Finds all providers belonging to a clinic with optional filters.
   *
   * @param clinicId - The clinic's UUID
   * @param filters - Optional filter, sort, and pagination options
   * @returns Paginated response with providers and total count
   */
  async findByClinicId(
    clinicId: string,
    filters?: Partial<FindProvidersFilters>,
  ): Promise<FindProvidersPaginatedResponseDto> {
    return this.findProvidersByClinicUseCase.execute({
      clinicId,
      ...filters,
    });
  }

  /**
   * Finds a provider by their linked user account.
   *
   * @param userId - The user's UUID
   * @returns The provider entity if found, null otherwise
   */
  async findByUserId(userId: string): Promise<Provider | null> {
    return this.findProviderByUserIdUseCase.execute(userId);
  }
}
