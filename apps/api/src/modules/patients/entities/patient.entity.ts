import type { WithOptional } from '@/shared/core/default.entity';
import { randomUUID } from 'crypto';

/**
 * Document type reference.
 */
export interface DocumentType {
  id: string;
  code: string;
  name: string;
}

/**
 * Patient document entity.
 */
export interface PatientDocument {
  id: string;
  clinicId: string;
  patientId: string;
  documentTypeId: string;
  value: string;
  documentType: DocumentType;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Patient entity representing a patient in the HealthSync platform.
 *
 * @remarks
 * Patients are always associated with a clinic. They contain contact information
 * for WhatsApp communication and optional medical record identifiers.
 *
 * @example
 * ```typescript
 * const patient = new Patient({
 *   clinicId: 'clinic-uuid',
 *   name: 'Maria Silva',
 *   phone: '+5511999999999',
 * });
 * ```
 */
export class Patient {
  /** Unique identifier for the patient (UUID) */
  id: string;

  /** Reference to the clinic the patient belongs to */
  clinicId: string;

  /** Patient's full name */
  name: string;

  /** Patient's phone number for WhatsApp contact */
  phone: string;

  /** Patient's email address */
  email: string | null;

  /** Patient's date of birth */
  dateOfBirth: Date | null;

  /** Optional clinic internal medical record ID */
  medicalRecordId: string | null;

  /** Additional notes about the patient */
  notes: string | null;

  /** Patient's documents (CPF, RG, etc.) */
  documents: PatientDocument[];

  /** Timestamp when the patient was created */
  createdAt: Date;

  /** Timestamp when the patient was last updated */
  updatedAt: Date;

  /** Timestamp when the patient was soft-deleted, null if active */
  deletedAt: Date | null;

  /**
   * Creates a new Patient instance.
   *
   * @param data - The patient data with optional fields for defaults
   */
  constructor(
    data: WithOptional<
      Omit<Patient, 'cpf'>,
      | 'id'
      | 'email'
      | 'dateOfBirth'
      | 'medicalRecordId'
      | 'notes'
      | 'documents'
      | 'createdAt'
      | 'updatedAt'
      | 'deletedAt'
    >,
  ) {
    Object.assign(this, {
      ...data,
      id: data.id ?? randomUUID(),
      email: data.email ?? null,
      dateOfBirth: data.dateOfBirth ?? null,
      medicalRecordId: data.medicalRecordId ?? null,
      notes: data.notes ?? null,
      documents: data.documents ?? [],
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
      deletedAt: data.deletedAt ?? null,
    });
  }

  /**
   * Gets the CPF document value if exists.
   */
  get cpf(): string | null {
    const cpfDoc = this.documents.find((d) => d.documentType.code === 'CPF');
    return cpfDoc?.value ?? null;
  }
}
