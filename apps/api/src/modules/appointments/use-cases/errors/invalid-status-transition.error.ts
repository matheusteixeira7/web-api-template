import type { AppointmentStatus } from '../../entities/appointment.entity';

export class InvalidStatusTransitionError extends Error {
  constructor(from: AppointmentStatus, to: AppointmentStatus) {
    super(`Invalid status transition from ${from} to ${to}.`);
  }
}
