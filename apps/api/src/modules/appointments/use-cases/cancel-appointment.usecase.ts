import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import { Injectable } from '@nestjs/common';
import type {
  CancelAppointmentInputDto,
  CancelAppointmentResponseDto,
} from '../dto/cancel-appointment.dto';
import { AppointmentStatusEvent } from '../entities/appointment-status-event.entity';
import type { AppointmentStatus } from '../entities/appointment.entity';
import { AppointmentsRepository } from '../repositories/appointments.repository';
import { InvalidStatusTransitionError } from './errors/invalid-status-transition.error';

/**
 * Use case for cancelling an appointment.
 */
@Injectable()
export class CancelAppointmentUseCase {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
  ) {}

  /**
   * Executes the appointment cancellation operation.
   *
   * @param input - The cancellation data
   * @returns The cancelled appointment entity
   * @throws ResourceNotFoundError if appointment not found
   * @throws InvalidStatusTransitionError if appointment cannot be cancelled
   */
  async execute(
    input: CancelAppointmentInputDto,
  ): Promise<CancelAppointmentResponseDto> {
    const { appointmentId, clinicId, cancelledById, notes } = input;

    // Find existing appointment
    const appointment = await this.appointmentsRepository.findById(
      appointmentId,
      clinicId,
    );
    if (!appointment) {
      throw new ResourceNotFoundError();
    }

    // Validate cancellation is allowed
    const cancellableStatuses: AppointmentStatus[] = ['SCHEDULED', 'CONFIRMED'];
    if (!cancellableStatuses.includes(appointment.status)) {
      throw new InvalidStatusTransitionError(appointment.status, 'CANCELLED');
    }

    const previousStatus = appointment.status;

    // Update status
    appointment.status = 'CANCELLED';

    // Save appointment
    const updatedAppointment =
      await this.appointmentsRepository.save(appointment);

    // Create status event for audit trail
    const statusEvent = new AppointmentStatusEvent({
      appointmentId,
      previousStatus,
      newStatus: 'CANCELLED',
      changedById: cancelledById ?? null,
      notes: notes ?? 'Appointment cancelled',
    });
    await this.appointmentsRepository.createStatusEvent(statusEvent);

    return {
      appointment: updatedAppointment,
    };
  }
}
