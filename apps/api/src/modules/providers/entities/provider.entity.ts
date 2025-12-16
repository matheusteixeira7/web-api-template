import type { WithOptional } from '@/shared/core/default.entity';
import { randomUUID } from 'crypto';

/**
 * Provider entity representing a healthcare provider (doctor, therapist, etc.)
 * in the HealthSync platform.
 *
 * @remarks
 * Providers are always associated with a clinic. A provider may optionally
 * be linked to a user account, allowing them to log in and manage their schedule.
 *
 * @example
 * ```typescript
 * const provider = new Provider({
 *   clinicId: 'clinic-uuid',
 *   name: 'Dr. João Silva',
 *   specialty: 'Cardiologia',
 * });
 * ```
 */
export class Provider {
  /** Unique identifier for the provider (UUID) */
  id: string;

  /** Reference to the clinic the provider belongs to */
  clinicId: string;

  /** Optional reference to a user account (null if provider has no login) */
  userId: string | null;

  /** Provider's display name */
  name: string;

  /** Provider's medical specialty (e.g., "Cardiologia", "Pediatria") */
  specialty: string | null;

  /** Default appointment duration in minutes */
  defaultAppointmentDuration: number;

  /** Working hours schedule per location (JSONB) */
  workingHours: Record<string, unknown> | null;

  /** Timestamp when the provider was created */
  createdAt: Date;

  /** Timestamp when the provider was last updated */
  updatedAt: Date;

  /** Timestamp when the provider was soft-deleted, null if active */
  deletedAt: Date | null;

  /**
   * Creates a new Provider instance.
   *
   * @param data - The provider data with optional fields for defaults
   */
  constructor(
    data: WithOptional<
      Provider,
      | 'id'
      | 'userId'
      | 'specialty'
      | 'defaultAppointmentDuration'
      | 'workingHours'
      | 'createdAt'
      | 'updatedAt'
      | 'deletedAt'
    >,
  ) {
    Object.assign(this, {
      ...data,
      id: data.id ?? randomUUID(),
      userId: data.userId ?? null,
      specialty: data.specialty ?? null,
      defaultAppointmentDuration: data.defaultAppointmentDuration ?? 30,
      workingHours: data.workingHours ?? null,
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
      deletedAt: data.deletedAt ?? null,
    });
  }
}
