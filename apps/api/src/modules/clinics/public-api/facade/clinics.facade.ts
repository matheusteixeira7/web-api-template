import {
  ClinicsApi,
  type CreateClinicData,
} from '@/shared/public-api/interface/clinics-api.interface';
import { UsersApi } from '@/shared/public-api/interface/users-api.interface';
import { Inject, Injectable } from '@nestjs/common';
import { Clinic } from '../../entities/clinic.entity';
import { CreateClinicUseCase } from '../../use-cases/create-clinic.usecase';
import { FindClinicUseCase } from '../../use-cases/find-clinic.usecase';
import { UpdateClinicSetupUseCase } from '../../use-cases/update-clinic-setup.usecase';

/**
 * ClinicsFacade - Public API for Clinics module
 *
 * Delegates to Use Cases, not repositories.
 * Demonstrates cross-module communication via facades.
 *
 * Example: verifyUserBelongsToClinic() calls UsersApi (another facade)
 * to perform authorization checks without direct database access.
 */
@Injectable()
export class ClinicsFacade implements ClinicsApi {
  constructor(
    private readonly findClinicUseCase: FindClinicUseCase,
    private readonly createClinicUseCase: CreateClinicUseCase,
    private readonly updateClinicSetupUseCase: UpdateClinicSetupUseCase,
    @Inject(UsersApi) private readonly usersApi: UsersApi, // ✨ Facade calls facade!
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

  /**
   * Verifies if a user belongs to a clinic (authorization)
   * Calls UsersApi facade instead of querying database directly
   *
   * This demonstrates the Facade Pattern for cross-module communication:
   * - ClinicsFacade → UsersApi → UsersFacade → FindUserUseCase → Repository
   * - No direct Prisma access
   * - Respects module boundaries
   */
  async verifyUserBelongsToClinic(
    userId: string,
    clinicId: string,
  ): Promise<boolean> {
    const user = await this.usersApi.findById(userId); // ✨ Cross-module via facade
    return user?.clinicId === clinicId;
  }
}
