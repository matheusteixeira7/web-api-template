import type { WithOptional } from '@/shared/core/default.entity';
import { randomUUID } from 'crypto';
import type { AppointmentStatus } from './appointment.entity';

/**
 * AppointmentStatusEvent entity representing a status change event
 * in an appointment's history.
 *
 * @remarks
 * This entity provides an audit trail of all status changes for an appointment,
 * including who made the change and any notes associated with it.
 */
export class AppointmentStatusEvent {
  /** Unique identifier for the event (UUID) */
  id: string;

  /** Reference to the appointment */
  appointmentId: string;

  /** Previous status before the change (null for initial status) */
  previousStatus: AppointmentStatus | null;

  /** New status after the change */
  newStatus: AppointmentStatus;

  /** Reference to the user who made the change */
  changedById: string | null;

  /** Timestamp when the status was changed */
  changedAt: Date;

  /** Optional notes about the status change */
  notes: string | null;

  constructor(
    data: WithOptional<
      AppointmentStatusEvent,
      'id' | 'previousStatus' | 'changedById' | 'changedAt' | 'notes'
    >,
  ) {
    Object.assign(this, {
      ...data,
      id: data.id ?? randomUUID(),
      previousStatus: data.previousStatus ?? null,
      changedById: data.changedById ?? null,
      changedAt: data.changedAt ?? new Date(),
      notes: data.notes ?? null,
    });
  }
}
