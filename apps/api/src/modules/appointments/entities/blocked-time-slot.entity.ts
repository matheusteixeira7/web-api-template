import type { WithOptional } from '@/shared/core/default.entity';
import { randomUUID } from 'crypto';

/**
 * BlockedTimeSlot entity representing a time period when a provider
 * is unavailable for appointments.
 *
 * @remarks
 * Blocked time slots are used to mark provider unavailability due to
 * holidays, emergencies, personal time, etc. These slots prevent
 * appointments from being scheduled during the blocked period.
 */
export class BlockedTimeSlot {
  /** Unique identifier for the blocked time slot (UUID) */
  id: string;

  /** Reference to the provider */
  providerId: string;

  /** Optional reference to a specific location (null means all locations) */
  locationId: string | null;

  /** Start time of the blocked period (stored in UTC) */
  startDatetime: Date;

  /** End time of the blocked period (stored in UTC) */
  endDatetime: Date;

  /** Optional reason for the block (e.g., holiday, emergency, personal) */
  reason: string | null;

  /** Reference to the user who created the block */
  createdById: string | null;

  /** Timestamp when the block was created */
  createdAt: Date;

  constructor(
    data: WithOptional<
      BlockedTimeSlot,
      'id' | 'locationId' | 'reason' | 'createdById' | 'createdAt'
    >,
  ) {
    Object.assign(this, {
      ...data,
      id: data.id ?? randomUUID(),
      locationId: data.locationId ?? null,
      reason: data.reason ?? null,
      createdById: data.createdById ?? null,
      createdAt: data.createdAt ?? new Date(),
    });
  }
}
