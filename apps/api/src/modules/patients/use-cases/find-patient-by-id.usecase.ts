import { Injectable } from '@nestjs/common';
import { Patient } from '../entities/patient.entity';
import { PatientsRepository } from '../repositories/patients.repository';

interface FindPatientByIdInput {
  patientId: string;
  clinicId: string;
}

/**
 * Use case for finding a patient by their ID within a specific clinic.
 *
 * @remarks
 * Lookup by unique identifier with clinic-based access control.
 * Ensures patients can only be accessed by users from the same clinic.
 */
@Injectable()
export class FindPatientByIdUseCase {
  constructor(private readonly patientsRepository: PatientsRepository) {}

  /**
   * Finds a patient by their ID within the specified clinic.
   *
   * @param input - The patient ID and clinic ID for access control
   * @returns The patient entity if found and belongs to the clinic, null otherwise
   */
  async execute(input: FindPatientByIdInput): Promise<Patient | null> {
    return this.patientsRepository.findById(input.patientId, input.clinicId);
  }
}
