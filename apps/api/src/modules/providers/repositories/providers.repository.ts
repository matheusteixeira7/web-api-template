import { Provider as PrismaProvider } from '@workspace/database';
import { Provider } from '../entities/provider.entity';
import type { FindProvidersFilters } from '../types/provider-filters.types';

/**
 * Abstract repository interface for provider data access.
 *
 * @remarks
 * This defines the contract for provider persistence operations.
 * Implementations handle the actual database interactions.
 * Following the Repository Pattern for data access abstraction.
 */
export abstract class ProvidersRepository {
  /**
   * Finds a provider by their unique identifier.
   * @param id - The provider's UUID
   * @returns The provider entity if found, null otherwise
   */
  abstract findById(id: string): Promise<Provider | null>;

  /**
   * Finds providers belonging to a clinic with filters and pagination.
   * @param clinicId - The clinic's UUID
   * @param filters - Filter, sort, and pagination options
   * @returns Object containing provider entities and total count
   */
  abstract findByClinicId(
    clinicId: string,
    filters: FindProvidersFilters,
  ): Promise<{ providers: Provider[]; total: number }>;

  /**
   * Finds a provider by their linked user account.
   * @param userId - The user's UUID
   * @returns The provider entity if found, null otherwise
   */
  abstract findByUserId(userId: string): Promise<Provider | null>;

  /**
   * Creates a new provider in the database.
   * @param data - The provider entity to persist
   * @returns The created provider entity
   */
  abstract create(data: Provider): Promise<Provider>;

  /**
   * Updates an existing provider in the database.
   * @param provider - The provider entity with updated data
   * @returns The updated provider entity
   */
  abstract save(provider: Provider): Promise<Provider>;

  /**
   * Soft deletes a provider by setting deletedAt timestamp.
   * @param id - The provider's UUID
   */
  abstract softDelete(id: string): Promise<void>;

  /**
   * Maps a Prisma provider record to a Provider domain entity.
   * @param provider - The Prisma provider record
   * @returns The mapped Provider entity
   */
  abstract mapToEntity(provider: PrismaProvider): Provider;
}
