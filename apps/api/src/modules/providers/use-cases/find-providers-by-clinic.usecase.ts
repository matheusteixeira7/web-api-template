import { Injectable } from '@nestjs/common';
import type { FindProvidersPaginatedResponseDto } from '../dto/find-provider.dto';
import { ProvidersRepository } from '../repositories/providers.repository';
import type {
  FindProvidersByClinicInput,
  FindProvidersFilters,
} from '../types/provider-filters.types';

/**
 * Use case for finding providers belonging to a clinic.
 *
 * @remarks
 * Returns providers for a given clinic with support for filtering,
 * sorting, and pagination.
 */
@Injectable()
export class FindProvidersByClinicUseCase {
  constructor(private readonly providersRepository: ProvidersRepository) {}

  /**
   * Finds providers for a clinic with filters and pagination.
   *
   * @param input - Clinic ID and optional filter parameters
   * @returns Paginated provider response with total count
   */
  async execute(
    input: FindProvidersByClinicInput,
  ): Promise<FindProvidersPaginatedResponseDto> {
    const { clinicId, ...queryParams } = input;

    // Apply defaults for optional fields
    const filters: FindProvidersFilters = {
      search: queryParams.search,
      status: queryParams.status ?? 'all',
      specialty: queryParams.specialty,
      sortBy: queryParams.sortBy ?? 'name',
      sortDir: queryParams.sortDir ?? 'asc',
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
    };

    const { providers, total } = await this.providersRepository.findByClinicId(
      clinicId,
      filters,
    );

    const totalPages = Math.ceil(total / filters.perPage);

    return {
      providers,
      total,
      page: filters.page,
      perPage: filters.perPage,
      totalPages,
    };
  }
}
