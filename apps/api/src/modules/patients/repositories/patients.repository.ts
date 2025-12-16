import { Patient as PrismaPatient } from '@workspace/database';
import { Patient } from '../entities/patient.entity';
import type { FindPatientsFilters } from '../types/patient-filters.types';

/**
 * Abstract repository interface for patient data access.
 *
 * @remarks
 * This defines the contract for patient persistence operations.
 * Implementations handle the actual database interactions.
 * Following the Repository Pattern for data access abstraction.
 */
export abstract class PatientsRepository {
  /**
   * Finds a patient by their unique identifier within a specific clinic.
   * @param id - The patient's UUID
   * @param clinicId - The clinic's UUID for access control
   * @returns The patient entity if found and belongs to the clinic, null otherwise
   */
  abstract findById(id: string, clinicId: string): Promise<Patient | null>;

  /**
   * Finds patients belonging to a clinic with filters and pagination.
   * @param clinicId - The clinic's UUID
   * @param filters - Filter, sort, and pagination options
   * @returns Object containing patient entities and total count
   */
  abstract findByClinicId(
    clinicId: string,
    filters: FindPatientsFilters,
  ): Promise<{ patients: Patient[]; total: number }>;

  /**
   * Finds a patient by phone number within a clinic.
   * @param clinicId - The clinic's UUID
   * @param phone - The patient's phone number
   * @returns The patient entity if found, null otherwise
   */
  abstract findByPhone(
    clinicId: string,
    phone: string,
  ): Promise<Patient | null>;

  /**
   * Creates a new patient in the database.
   * @param data - The patient entity to persist
   * @returns The created patient entity
   */
  abstract create(data: Patient): Promise<Patient>;

  /**
   * Updates an existing patient in the database.
   * @param patient - The patient entity with updated data
   * @returns The updated patient entity
   */
  abstract save(patient: Patient): Promise<Patient>;

  /**
   * Soft deletes a patient by setting deletedAt timestamp.
   * @param id - The patient's UUID
   */
  abstract softDelete(id: string): Promise<void>;

  /**
   * Creates or updates a CPF document for a patient.
   * @param patientId - The patient's UUID
   * @param clinicId - The clinic's UUID
   * @param cpfValue - The CPF value (normalized) or null to remove
   */
  abstract upsertCpfDocument(
    patientId: string,
    clinicId: string,
    cpfValue: string | null,
  ): Promise<void>;

  /**
   * Maps a Prisma patient record to a Patient domain entity.
   * @param patient - The Prisma patient record
   * @returns The mapped Patient entity
   */
  abstract mapToEntity(patient: PrismaPatient): Patient;
}
