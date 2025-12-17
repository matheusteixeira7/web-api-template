import { Injectable } from '@nestjs/common';
import type { Appointment } from '../entities/appointment.entity';
import { AppointmentsRepository } from '../repositories/appointments.repository';

/**
 * Use case for finding an appointment by ID.
 */
@Injectable()
export class FindAppointmentByIdUseCase {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
  ) {}

  /**
   * Executes the appointment lookup operation.
   *
   * @param id - The appointment's UUID
   * @param clinicId - The clinic's UUID for access control
   * @returns The appointment entity if found, null otherwise
   */
  async execute(id: string, clinicId: string): Promise<Appointment | null> {
    return this.appointmentsRepository.findById(id, clinicId);
  }
}
