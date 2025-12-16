import { Injectable } from '@nestjs/common';
import { Patient } from '../entities/patient.entity';
import { PatientsRepository } from '../repositories/patients.repository';

/**
 * Use case for finding a patient by their phone number within a clinic.
 *
 * @remarks
 * Useful for checking if a patient already exists before creating a new one.
 */
@Injectable()
export class FindPatientByPhoneUseCase {
  constructor(private readonly patientsRepository: PatientsRepository) {}

  /**
   * Finds a patient by their phone number within a clinic.
   *
   * @param clinicId - The clinic's UUID
   * @param phone - The patient's phone number
   * @returns The patient entity if found, null otherwise
   */
  async execute(clinicId: string, phone: string): Promise<Patient | null> {
    return this.patientsRepository.findByPhone(clinicId, phone);
  }
}
