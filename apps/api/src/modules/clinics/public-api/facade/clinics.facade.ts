import {
  ClinicsApi,
  type CreateClinicData,
} from '@/shared/public-api/interface/clinics-api.interface';
import { Injectable } from '@nestjs/common';
import { Clinic } from '../../entities/clinic.entity';
import { CreateClinicUseCase } from '../../use-cases/create-clinic.usecase';
import { FindClinicUseCase } from '../../use-cases/find-clinic.usecase';
import { UpdateClinicSetupUseCase } from '../../use-cases/update-clinic-setup.usecase';
import { VerifyUserBelongsToClinicUseCase } from '../../use-cases/verify-user-belongs-to-clinic.usecase';

/**
 * ClinicsFacade - Public API for Clinics module
 *
 * Delegates to Use Cases, not repositories.
 * Facade is pure delegation - no business logic.
 */
@Injectable()
export class ClinicsFacade implements ClinicsApi {
  constructor(
    private readonly findClinicUseCase: FindClinicUseCase,
    private readonly createClinicUseCase: CreateClinicUseCase,
    private readonly updateClinicSetupUseCase: UpdateClinicSetupUseCase,
    private readonly verifyUserBelongsToClinicUseCase: VerifyUserBelongsToClinicUseCase,
  ) {}

  async findById(id: string): Promise<Clinic | null> {
    return this.findClinicUseCase.execute({ id });
  }

  async createClinic(data: CreateClinicData): Promise<Clinic> {
    return this.createClinicUseCase.execute(data);
  }

  async updateClinic(clinic: Clinic): Promise<Clinic> {
    return await this.updateClinicSetupUseCase.updateClinic(clinic);
  }

  async verifyUserBelongsToClinic(
    userId: string,
    clinicId: string,
  ): Promise<boolean> {
    return this.verifyUserBelongsToClinicUseCase.execute(userId, clinicId);
  }
}
