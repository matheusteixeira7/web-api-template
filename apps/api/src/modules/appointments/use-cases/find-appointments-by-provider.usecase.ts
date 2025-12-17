import { Injectable } from '@nestjs/common';
import type { FindAppointmentsPaginatedResponseDto } from '../dto/find-appointment.dto';
import { AppointmentsRepository } from '../repositories/appointments.repository';
import type {
  FindAppointmentsByProviderInput,
  FindAppointmentsFilters,
} from '../types/appointment-filters.types';

/**
 * Use case for finding appointments by provider with filters and pagination.
 */
@Injectable()
export class FindAppointmentsByProviderUseCase {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
  ) {}

  /**
   * Executes the appointments search operation by provider.
   *
   * @param input - The search input with provider ID and optional filters
   * @returns Paginated response with appointments and total count
   */
  async execute(
    input: FindAppointmentsByProviderInput,
  ): Promise<FindAppointmentsPaginatedResponseDto> {
    const { providerId, clinicId, ...queryParams } = input;

    // Apply defaults for optional fields
    const filters: FindAppointmentsFilters = {
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
      status: queryParams.status ?? 'all',
      sortBy: queryParams.sortBy ?? 'appointmentStart',
      sortDir: queryParams.sortDir ?? 'asc',
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
    };

    const { appointments, total } =
      await this.appointmentsRepository.findByProviderId(
        providerId,
        clinicId,
        filters,
      );

    const totalPages = Math.ceil(total / filters.perPage);

    return {
      appointments,
      total,
      page: filters.page,
      perPage: filters.perPage,
      totalPages,
    };
  }
}
