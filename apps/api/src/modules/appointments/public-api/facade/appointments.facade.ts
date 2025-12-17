import type { AppointmentsApi } from '@/shared/public-api/interface/appointments-api.interface';
import { Injectable } from '@nestjs/common';
import type { FindAppointmentsPaginatedResponseDto } from '../../dto/find-appointment.dto';
import type { Appointment } from '../../entities/appointment.entity';
import type { FindAppointmentsFilters } from '../../types/appointment-filters.types';
import { FindAppointmentByIdUseCase } from '../../use-cases/find-appointment-by-id.usecase';
import { FindAppointmentsByClinicUseCase } from '../../use-cases/find-appointments-by-clinic.usecase';
import { FindAppointmentsByPatientUseCase } from '../../use-cases/find-appointments-by-patient.usecase';
import { FindAppointmentsByProviderUseCase } from '../../use-cases/find-appointments-by-provider.usecase';

/**
 * Facade implementation for the Appointments public API.
 *
 * @remarks
 * This class serves as the public entry point for external modules
 * to interact with the Appointments domain. It implements the AppointmentsApi
 * interface and delegates all operations to the appropriate use cases.
 *
 * Following the Facade Pattern:
 * - Pure delegation layer (no business logic)
 * - All operations delegate to use cases
 * - Enables loose coupling between modules
 */
@Injectable()
export class AppointmentsFacade implements AppointmentsApi {
  constructor(
    private readonly findAppointmentByIdUseCase: FindAppointmentByIdUseCase,
    private readonly findAppointmentsByClinicUseCase: FindAppointmentsByClinicUseCase,
    private readonly findAppointmentsByProviderUseCase: FindAppointmentsByProviderUseCase,
    private readonly findAppointmentsByPatientUseCase: FindAppointmentsByPatientUseCase,
  ) {}

  /** @inheritdoc */
  async findById(id: string, clinicId: string): Promise<Appointment | null> {
    return this.findAppointmentByIdUseCase.execute(id, clinicId);
  }

  /** @inheritdoc */
  async findByClinicId(
    clinicId: string,
    filters?: Partial<FindAppointmentsFilters>,
  ): Promise<FindAppointmentsPaginatedResponseDto> {
    return this.findAppointmentsByClinicUseCase.execute({
      clinicId,
      ...filters,
    });
  }

  /** @inheritdoc */
  async findByProviderId(
    providerId: string,
    clinicId: string,
    filters?: Partial<FindAppointmentsFilters>,
  ): Promise<FindAppointmentsPaginatedResponseDto> {
    return this.findAppointmentsByProviderUseCase.execute({
      providerId,
      clinicId,
      ...filters,
    });
  }

  /** @inheritdoc */
  async findByPatientId(
    patientId: string,
    clinicId: string,
    filters?: Partial<FindAppointmentsFilters>,
  ): Promise<FindAppointmentsPaginatedResponseDto> {
    return this.findAppointmentsByPatientUseCase.execute({
      patientId,
      clinicId,
      ...filters,
    });
  }
}
