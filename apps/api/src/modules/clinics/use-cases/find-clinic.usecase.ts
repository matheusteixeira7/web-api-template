import { Injectable } from '@nestjs/common';
import type { FindClinicInputDto } from '../dto/find-clinic.dto';
import { Clinic } from '../entities/clinic.entity';
import { ClinicsRepository } from '../repositories/clinics.repository';

/**
 * FindClinicUseCase - Find clinic operations
 *
 * This use case encapsulates clinic finding logic.
 * Extracted from UpdateClinicSetupUseCase to follow SRP.
 */
@Injectable()
export class FindClinicUseCase {
  constructor(private readonly clinicsRepository: ClinicsRepository) {}

  /**
   * Finds a clinic by its unique identifier.
   *
   * @param input - The input containing the clinic ID
   * @returns The clinic if found, null otherwise
   */
  async execute(input: FindClinicInputDto): Promise<Clinic | null> {
    return this.clinicsRepository.findById(input.id);
  }
}
