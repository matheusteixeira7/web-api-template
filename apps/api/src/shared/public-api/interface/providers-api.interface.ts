import type { FindProvidersPaginatedResponseDto } from '@/modules/providers/dto/find-provider.dto';
import { Provider } from '@/modules/providers/entities/provider.entity';
import type { FindProvidersFilters } from '@/modules/providers/types/provider-filters.types';

/**
 * Public API contract for Providers module
 *
 * This interface defines all operations that external modules can perform
 * on the Providers module. It serves as the explicit communication contract
 * following the Facade Pattern.
 *
 * Usage:
 * - External modules inject via Symbol token: @Inject(ProvidersApi)
 * - Never import concrete implementations (ProvidersFacade, repositories)
 * - This enables polymorphism: swap ProvidersFacade ↔ ProvidersHttpClient
 */
export interface ProvidersApi {
  /**
   * Find provider by ID
   * @param id Provider unique identifier
   * @returns Provider entity or null if not found
   */
  findById(id: string): Promise<Provider | null>;

  /**
   * Find all providers belonging to a clinic with optional filters
   * @param clinicId Clinic unique identifier
   * @param filters Optional filter, sort, and pagination options
   * @returns Paginated response with providers and total count
   */
  findByClinicId(
    clinicId: string,
    filters?: Partial<FindProvidersFilters>,
  ): Promise<FindProvidersPaginatedResponseDto>;

  /**
   * Find provider by linked user account
   * @param userId User unique identifier
   * @returns Provider entity or null if not found
   */
  findByUserId(userId: string): Promise<Provider | null>;
}

/**
 * Symbol token for dependency injection
 *
 * This Symbol is used as the DI token instead of the class name,
 * preventing naming collisions and enabling polymorphic implementations.
 *
 * Example:
 * @Injectable()
 * export class SomeService {
 *   constructor(@Inject(ProvidersApi) private providersApi: ProvidersApi) {}
 * }
 */
export const ProvidersApi = Symbol('ProvidersApi');
