import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import { Injectable } from '@nestjs/common';
import type { DeleteAppointmentInputDto } from '../dto/delete-appointment.dto';
import { AppointmentsRepository } from '../repositories/appointments.repository';

/**
 * Use case for soft-deleting an appointment.
 */
@Injectable()
export class DeleteAppointmentUseCase {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
  ) {}

  /**
   * Executes the appointment soft-delete operation.
   *
   * @param input - The deletion data
   * @throws ResourceNotFoundError if appointment not found
   */
  async execute(input: DeleteAppointmentInputDto): Promise<void> {
    const { appointmentId, clinicId } = input;

    // Validate appointment exists and belongs to clinic
    const appointment = await this.appointmentsRepository.findById(
      appointmentId,
      clinicId,
    );
    if (!appointment) {
      throw new ResourceNotFoundError();
    }

    await this.appointmentsRepository.softDelete(appointmentId);
  }
}
