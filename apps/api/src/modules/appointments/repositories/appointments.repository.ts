import type {
  Appointment as PrismaAppointment,
  AppointmentStatusEvent as PrismaStatusEvent,
} from '@workspace/database';
import type { Appointment } from '../entities/appointment.entity';
import type { AppointmentStatusEvent } from '../entities/appointment-status-event.entity';
import type { FindAppointmentsFilters } from '../types/appointment-filters.types';

/**
 * Abstract repository interface for appointment data access.
 *
 * @remarks
 * This defines the contract for appointment persistence operations.
 * Implementations handle the actual database interactions.
 * Following the Repository Pattern for data access abstraction.
 */
export abstract class AppointmentsRepository {
  /**
   * Finds an appointment by its unique identifier within a clinic.
   * @param id - The appointment's UUID
   * @param clinicId - The clinic's UUID for access control
   * @returns The appointment entity if found, null otherwise
   */
  abstract findById(id: string, clinicId: string): Promise<Appointment | null>;

  /**
   * Finds appointments belonging to a clinic with filters and pagination.
   * @param clinicId - The clinic's UUID
   * @param filters - Filter, sort, and pagination options
   * @returns Object containing appointment entities and total count
   */
  abstract findByClinicId(
    clinicId: string,
    filters: FindAppointmentsFilters,
  ): Promise<{ appointments: Appointment[]; total: number }>;

  /**
   * Finds appointments for a specific provider with filters and pagination.
   * @param providerId - The provider's UUID
   * @param clinicId - The clinic's UUID for access control
   * @param filters - Filter, sort, and pagination options
   * @returns Object containing appointment entities and total count
   */
  abstract findByProviderId(
    providerId: string,
    clinicId: string,
    filters: FindAppointmentsFilters,
  ): Promise<{ appointments: Appointment[]; total: number }>;

  /**
   * Finds appointments for a specific patient with filters and pagination.
   * @param patientId - The patient's UUID
   * @param clinicId - The clinic's UUID for access control
   * @param filters - Filter, sort, and pagination options
   * @returns Object containing appointment entities and total count
   */
  abstract findByPatientId(
    patientId: string,
    clinicId: string,
    filters: FindAppointmentsFilters,
  ): Promise<{ appointments: Appointment[]; total: number }>;

  /**
   * Creates a new appointment in the database.
   * @param data - The appointment entity to persist
   * @returns The created appointment entity
   */
  abstract create(data: Appointment): Promise<Appointment>;

  /**
   * Creates a new appointment and its initial status event in a single transaction.
   * @param appointment - The appointment entity to persist
   * @param statusEvent - The initial status event entity to persist
   * @returns The created appointment entity
   */
  abstract createWithStatusEvent(
    appointment: Appointment,
    statusEvent: AppointmentStatusEvent,
  ): Promise<Appointment>;

  /**
   * Updates an existing appointment in the database.
   * @param appointment - The appointment entity with updated data
   * @returns The updated appointment entity
   */
  abstract save(appointment: Appointment): Promise<Appointment>;

  /**
   * Updates an appointment and creates a status event in a single transaction.
   * @param appointment - The appointment entity with updated data
   * @param statusEvent - The status event entity to persist
   * @returns The updated appointment entity
   */
  abstract saveWithStatusEvent(
    appointment: Appointment,
    statusEvent: AppointmentStatusEvent,
  ): Promise<Appointment>;

  /**
   * Soft deletes an appointment by setting deletedAt timestamp.
   * @param id - The appointment's UUID
   */
  abstract softDelete(id: string): Promise<void>;

  /**
   * Creates a status event record for audit trail.
   * @param event - The status event entity to persist
   */
  abstract createStatusEvent(event: AppointmentStatusEvent): Promise<void>;

  /**
   * Checks if a provider is available during a specific time slot.
   * @param providerId - The provider's UUID
   * @param start - Start time of the slot
   * @param end - End time of the slot
   * @param excludeAppointmentId - Optional appointment ID to exclude (for updates)
   * @returns True if provider is available, false otherwise
   */
  abstract checkProviderAvailability(
    providerId: string,
    start: Date,
    end: Date,
    excludeAppointmentId?: string,
  ): Promise<boolean>;

  /**
   * Maps a Prisma appointment record to an Appointment domain entity.
   * @param appointment - The Prisma appointment record
   * @returns The mapped Appointment entity
   */
  abstract mapToEntity(appointment: PrismaAppointment): Appointment;

  /**
   * Maps a Prisma status event record to an AppointmentStatusEvent domain entity.
   * @param event - The Prisma status event record
   * @returns The mapped AppointmentStatusEvent entity
   */
  abstract mapStatusEventToEntity(
    event: PrismaStatusEvent,
  ): AppointmentStatusEvent;
}
