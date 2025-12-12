import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Clinic } from '../entities/clinic.entity';
import { ClinicsRepository } from '../repositories/clinics.repository';

/**
 * CreateClinicUseCase - Create a new clinic
 *
 * This use case handles simple clinic creation.
 * Used by Application Services for transactional operations.
 */
@Injectable()
export class CreateClinicUseCase {
  constructor(private readonly clinicsRepository: ClinicsRepository) {}

  async execute(input: CreateClinicInput): Promise<Clinic> {
    const clinic = new Clinic({
      id: randomUUID(),
      name: input.name,
      contactEmail: input.contactEmail ?? null,
      contactPhone: input.contactPhone ?? null,
      businessHours: null,
      timezone: input.timezone ?? 'America/Sao_Paulo',
      averageAppointmentValue: null,
      subscriptionId: null,
      isSetupComplete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    return this.clinicsRepository.create(clinic);
  }
}

export interface CreateClinicInput {
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  timezone?: string;
}
