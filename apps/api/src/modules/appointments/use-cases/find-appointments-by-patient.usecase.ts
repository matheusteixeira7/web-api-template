import { Injectable } from '@nestjs/common';
import type { FindAppointmentsPaginatedResponseDto } from '../dto/find-appointment.dto';
import { AppointmentsRepository } from '../repositories/appointments.repository';
import type {
  FindAppointmentsByPatientInput,
  FindAppointmentsFilters,
} from '../types/appointment-filters.types';

/**
 * Use case for finding appointments by patient within a clinic.
 */
@Injectable()
export class FindAppointmentsByPatientUseCase {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
  ) {}

  /**
   * Executes the appointments search operation by patient.
   *
   * @param input - The input parameters containing patientId, clinicId, and optional filters
   * @returns Paginated list of appointment entities with total count
   */
  async execute(
    input: FindAppointmentsByPatientInput,
  ): Promise<FindAppointmentsPaginatedResponseDto> {
    const { patientId, clinicId, ...queryParams } = input;

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
      await this.appointmentsRepository.findByPatientId(
        patientId,
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
