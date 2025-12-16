import { Injectable } from '@nestjs/common';
import type { FindPatientsPaginatedResponseDto } from '../dto/find-patient.dto';
import { PatientsRepository } from '../repositories/patients.repository';
import type {
  FindPatientsByClinicInput,
  FindPatientsFilters,
} from '../types/patient-filters.types';

/**
 * Use case for finding patients belonging to a clinic.
 *
 * @remarks
 * Returns patients for a given clinic with support for filtering,
 * sorting, and pagination.
 */
@Injectable()
export class FindPatientsByClinicUseCase {
  constructor(private readonly patientsRepository: PatientsRepository) {}

  /**
   * Finds patients for a clinic with filters and pagination.
   *
   * @param input - Clinic ID and optional filter parameters
   * @returns Paginated patient response with total count
   */
  async execute(
    input: FindPatientsByClinicInput,
  ): Promise<FindPatientsPaginatedResponseDto> {
    const { clinicId, ...queryParams } = input;

    // Apply defaults for optional fields
    const filters: FindPatientsFilters = {
      search: queryParams.search,
      status: queryParams.status ?? 'all',
      sortBy: queryParams.sortBy ?? 'name',
      sortDir: queryParams.sortDir ?? 'asc',
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
    };

    const { patients, total } = await this.patientsRepository.findByClinicId(
      clinicId,
      filters,
    );

    const totalPages = Math.ceil(total / filters.perPage);

    return {
      patients,
      total,
      page: filters.page,
      perPage: filters.perPage,
      totalPages,
    };
  }
}
