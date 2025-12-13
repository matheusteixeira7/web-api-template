import type { WithOptional } from '@/shared/core/default.entity';
import type { BusinessHours } from '@/shared/types/business-hours.type';
import { randomUUID } from 'crypto';

/**
 * Clinic entity representing a healthcare clinic in the system.
 *
 * @remarks
 * This is the core domain entity for clinics. A clinic is the primary tenant
 * in the HealthSync platform, containing users, appointments, and patients.
 *
 * @example
 * ```typescript
 * const clinic = new Clinic({
 *   name: 'Health Center',
 *   contactEmail: 'contact@healthcenter.com',
 * });
 * ```
 */
export class Clinic {
  /** Unique identifier for the clinic (UUID) */
  id: string;

  /** Display name of the clinic */
  name: string;

  /** Primary contact email address for the clinic */
  contactEmail: string | null;

  /** Primary contact phone number for the clinic */
  contactPhone: string | null;

  /** Operating hours configuration for each day of the week */
  businessHours: BusinessHours | null;

  /** IANA timezone identifier (e.g., 'America/Sao_Paulo') */
  timezone: string | null;

  /** Average value of appointments in BRL cents for ROI calculations */
  averageAppointmentValue: number | null;

  /** Reference to the clinic's subscription plan */
  subscriptionId: string | null;

  /** Indicates whether the clinic has completed the onboarding setup */
  isSetupComplete: boolean;

  /** Timestamp when the clinic was created */
  createdAt: Date;

  /** Timestamp when the clinic was last updated */
  updatedAt: Date;

  /** Timestamp when the clinic was soft-deleted, null if active */
  deletedAt: Date | null;

  /**
   * Creates a new Clinic instance.
   *
   * @param data - The clinic data with optional fields for defaults
   */
  constructor(
    data: WithOptional<
      Clinic,
      | 'id'
      | 'contactEmail'
      | 'contactPhone'
      | 'businessHours'
      | 'timezone'
      | 'averageAppointmentValue'
      | 'subscriptionId'
      | 'isSetupComplete'
      | 'createdAt'
      | 'updatedAt'
      | 'deletedAt'
    >,
  ) {
    Object.assign(this, {
      ...data,
      id: data.id || randomUUID(),
      contactEmail: data.contactEmail ?? null,
      contactPhone: data.contactPhone ?? null,
      businessHours: data.businessHours ?? null,
      timezone: data.timezone ?? null,
      averageAppointmentValue: data.averageAppointmentValue ?? null,
      subscriptionId: data.subscriptionId ?? null,
      isSetupComplete: data.isSetupComplete ?? false,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt ?? null,
    });
  }
}
