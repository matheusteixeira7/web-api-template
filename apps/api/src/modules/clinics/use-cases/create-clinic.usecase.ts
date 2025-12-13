import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { CreateClinicInputDto } from '../dto/create-clinic.dto';
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

  /**
   * Creates a new clinic with default settings.
   *
   * @param input - The clinic creation data
   * @returns The newly created clinic
   */
  async execute(input: CreateClinicInputDto): Promise<Clinic> {
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
