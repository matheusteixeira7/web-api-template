import type { WithOptional } from '@/shared/core/default.entity';
import { randomUUID } from 'crypto';

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED';

export type BookingSource = 'MANUAL' | 'PUBLIC_LINK' | 'API';

/**
 * Appointment entity representing a scheduled appointment between a patient
 * and a healthcare provider in the HealthSync platform.
 *
 * @remarks
 * Appointments contain denormalized patient and provider data for query performance.
 * These fields (patientName, patientPhone, providerName) should be synced when
 * the source patient or provider records are updated.
 */
export class Appointment {
  /** Unique identifier for the appointment (UUID) */
  id: string;

  /** Reference to the clinic the appointment belongs to */
  clinicId: string;

  /** Reference to the patient */
  patientId: string;

  /** Reference to the provider (doctor, therapist, etc.) */
  providerId: string;

  /** Optional reference to the clinic location */
  locationId: string | null;

  /** Start time of the appointment (stored in UTC) */
  appointmentStart: Date;

  /** End time of the appointment (stored in UTC) */
  appointmentEnd: Date;

  /** Denormalized patient name for query performance */
  patientName: string;

  /** Denormalized patient phone for query performance */
  patientPhone: string;

  /** Denormalized provider name for query performance */
  providerName: string;

  /** Current status of the appointment */
  status: AppointmentStatus;

  /** Optional notes about the appointment */
  notes: string | null;

  /** Source of the booking (manual, public_link, api) */
  bookingSource: BookingSource | null;

  /** Timestamp when the appointment was confirmed */
  confirmedAt: Date | null;

  /** Timestamp when the patient checked in */
  checkedInAt: Date | null;

  /** Reference to the user who created the appointment */
  createdById: string | null;

  /** Timestamp when the appointment was created */
  createdAt: Date;

  /** Timestamp when the appointment was last updated */
  updatedAt: Date;

  /** Timestamp when the appointment was soft-deleted, null if active */
  deletedAt: Date | null;

  constructor(
    data: WithOptional<
      Appointment,
      | 'id'
      | 'locationId'
      | 'status'
      | 'notes'
      | 'bookingSource'
      | 'confirmedAt'
      | 'checkedInAt'
      | 'createdById'
      | 'createdAt'
      | 'updatedAt'
      | 'deletedAt'
    >,
  ) {
    Object.assign(this, {
      ...data,
      id: data.id ?? randomUUID(),
      locationId: data.locationId ?? null,
      status: data.status ?? 'SCHEDULED',
      notes: data.notes ?? null,
      bookingSource: data.bookingSource ?? null,
      confirmedAt: data.confirmedAt ?? null,
      checkedInAt: data.checkedInAt ?? null,
      createdById: data.createdById ?? null,
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
      deletedAt: data.deletedAt ?? null,
    });
  }
}
