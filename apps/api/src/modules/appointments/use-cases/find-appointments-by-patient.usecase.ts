import { Injectable } from '@nestjs/common';
import type { Appointment } from '../entities/appointment.entity';
import { AppointmentsRepository } from '../repositories/appointments.repository';

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
   * @param patientId - The patient's UUID
   * @param clinicId - The clinic's UUID for access control
   * @returns Array of appointment entities
   */
  async execute(patientId: string, clinicId: string): Promise<Appointment[]> {
    return this.appointmentsRepository.findByPatientId(patientId, clinicId);
  }
}
