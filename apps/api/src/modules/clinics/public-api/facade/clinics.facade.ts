import {
  ClinicsApi,
  type CreateClinicData,
} from '@/shared/public-api/interface/clinics-api.interface';
import { Injectable } from '@nestjs/common';
import { Clinic } from '../../entities/clinic.entity';
import { CreateClinicUseCase } from '../../use-cases/create-clinic.usecase';
import { FindClinicUseCase } from '../../use-cases/find-clinic.usecase';
import { VerifyUserBelongsToClinicUseCase } from '../../use-cases/verify-user-belongs-to-clinic.usecase';

/**
 * ClinicsFacade - Public API for Clinics module
 *
 * This facade provides a clean interface for other modules to interact with
 * the Clinics module. It delegates to Use Cases, not repositories directly.
 *
 * @remarks
 * Facade is pure delegation - no business logic should be added here.
 * All business rules are handled by the underlying use cases.
 *
 * @example
 * ```typescript
 * const clinic = await clinicsFacade.findById('clinic-uuid');
 * ```
 */
@Injectable()
export class ClinicsFacade implements ClinicsApi {
  constructor(
    private readonly findClinicUseCase: FindClinicUseCase,
    private readonly createClinicUseCase: CreateClinicUseCase,
    private readonly verifyUserBelongsToClinicUseCase: VerifyUserBelongsToClinicUseCase,
  ) {}

  /**
   * Finds a clinic by its unique identifier.
   *
   * @param id - The unique identifier of the clinic
   * @returns The clinic entity if found, null otherwise
   */
  async findById(id: string): Promise<Clinic | null> {
    return this.findClinicUseCase.execute({ id });
  }

  /**
   * Creates a new clinic with the provided data.
   *
   * @param data - The data required to create a new clinic
   * @returns The newly created clinic entity
   */
  async createClinic(data: CreateClinicData): Promise<Clinic> {
    return this.createClinicUseCase.execute(data);
  }

  /**
   * Verifies if a user belongs to a specific clinic.
   *
   * @param userId - The unique identifier of the user
   * @param clinicId - The unique identifier of the clinic
   * @returns True if the user belongs to the clinic, false otherwise
   */
  async verifyUserBelongsToClinic(
    userId: string,
    clinicId: string,
  ): Promise<boolean> {
    return this.verifyUserBelongsToClinicUseCase.execute(userId, clinicId);
  }
}
