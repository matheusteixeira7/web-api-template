import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import { Injectable } from '@nestjs/common';
import type {
  UpdateAppointmentStatusInputDto,
  UpdateAppointmentStatusResponseDto,
} from '../dto/update-appointment-status.dto';
import { AppointmentStatusEvent } from '../entities/appointment-status-event.entity';
import { AppointmentsRepository } from '../repositories/appointments.repository';
import { validStatusTransitions } from '../types/appointment-status.types';
import { InvalidStatusTransitionError } from './errors/invalid-status-transition.error';

/**
 * Use case for updating an appointment's status.
 */
@Injectable()
export class UpdateAppointmentStatusUseCase {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
  ) {}

  /**
   * Executes the appointment status update operation.
   *
   * @param input - The status update data
   * @returns The updated appointment entity and previous status
   * @throws ResourceNotFoundError if appointment not found
   * @throws InvalidStatusTransitionError if status transition is invalid
   */
  async execute(
    input: UpdateAppointmentStatusInputDto,
  ): Promise<UpdateAppointmentStatusResponseDto> {
    const { appointmentId, clinicId, status, notes, changedById } = input;

    // Find existing appointment
    const appointment = await this.appointmentsRepository.findById(
      appointmentId,
      clinicId,
    );
    if (!appointment) {
      throw new ResourceNotFoundError();
    }

    const previousStatus = appointment.status;

    // Validate status transition
    const allowedTransitions = validStatusTransitions[previousStatus];
    if (!allowedTransitions.includes(status)) {
      throw new InvalidStatusTransitionError(previousStatus, status);
    }

    // Update status and related timestamps
    appointment.status = status;

    if (status === 'CONFIRMED' && !appointment.confirmedAt) {
      appointment.confirmedAt = new Date();
    }

    if (status === 'CHECKED_IN' && !appointment.checkedInAt) {
      appointment.checkedInAt = new Date();
    }

    // Create status event for audit trail
    const statusEvent = new AppointmentStatusEvent({
      appointmentId,
      previousStatus,
      newStatus: status,
      changedById: changedById ?? null,
      notes: notes ?? null,
    });

    // Save appointment and status event in a single transaction
    const updatedAppointment =
      await this.appointmentsRepository.saveWithStatusEvent(
        appointment,
        statusEvent,
      );

    return {
      appointment: updatedAppointment,
      previousStatus,
    };
  }
}
