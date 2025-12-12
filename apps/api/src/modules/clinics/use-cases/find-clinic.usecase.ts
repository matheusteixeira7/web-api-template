import { Injectable } from '@nestjs/common';
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

  async execute(input: FindClinicInput): Promise<Clinic | null> {
    return this.clinicsRepository.findById(input.id);
  }
}

export interface FindClinicInput {
  id: string;
}
