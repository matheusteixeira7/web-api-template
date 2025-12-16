import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import { Injectable } from '@nestjs/common';
import { PatientsRepository } from '../repositories/patients.repository';

/**
 * Input for deleting a patient.
 */
export interface DeletePatientInput {
  patientId: string;
  clinicId: string;
}

/**
 * Use case for soft-deleting a patient.
 *
 * @remarks
 * Sets the deletedAt timestamp rather than permanently removing the record.
 * Validates that the patient exists and belongs to the specified clinic.
 */
@Injectable()
export class DeletePatientUseCase {
  constructor(private readonly patientsRepository: PatientsRepository) {}

  /**
   * Soft deletes a patient.
   *
   * @param input - The patient and clinic identifiers
   * @throws {ResourceNotFoundError} If the patient is not found or doesn't belong to the clinic
   */
  async execute(input: DeletePatientInput): Promise<void> {
    const { patientId, clinicId } = input;

    const patient = await this.patientsRepository.findById(patientId, clinicId);

    if (!patient) {
      throw new ResourceNotFoundError();
    }

    await this.patientsRepository.softDelete(patientId);
  }
}
