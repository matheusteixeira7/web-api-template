import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import { UsersApi } from '@/shared/public-api/interface/users-api.interface';
import type { BusinessHours } from '@/shared/types/business-hours.type';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type {
  UpdateClinicSetupInputDto,
  UpdateClinicSetupResponseDto,
} from '../dto/update-clinic-setup.dto';
import type { Clinic } from '../entities/clinic.entity';
import { ClinicsRepository } from '../repositories/clinics.repository';

@Injectable()
export class UpdateClinicSetupUseCase {
  constructor(
    private readonly clinicsRepository: ClinicsRepository,
    @Inject(UsersApi) private readonly usersApi: UsersApi,
  ) {}

  async execute(
    data: UpdateClinicSetupInputDto,
  ): Promise<UpdateClinicSetupResponseDto> {
    const {
      clinicId,
      userId,
      name,
      contactPhone,
      contactEmail,
      businessHours,
      timezone,
      averageAppointmentValue,
    } = data;

    // Verify user belongs to the clinic
    const user = await this.usersApi.findById(userId);

    if (!user || user.clinicId !== clinicId) {
      throw new ForbiddenException(
        'User does not have permission to update this clinic',
      );
    }

    // Find the clinic
    const clinic = await this.clinicsRepository.findById(clinicId);

    if (!clinic) {
      throw new ResourceNotFoundError();
    }

    // Update clinic fields
    clinic.name = name;
    clinic.contactPhone = contactPhone;
    clinic.contactEmail = contactEmail ?? null;
    clinic.businessHours = businessHours as BusinessHours;
    clinic.timezone = timezone;
    clinic.averageAppointmentValue = averageAppointmentValue ?? null;
    clinic.isSetupComplete = true;

    // Save updated clinic
    const updatedClinic = await this.clinicsRepository.save(clinic);

    return {
      clinic: updatedClinic,
    };
  }

  /**
   * Method for facade usage
   */
  async updateClinic(clinic: Clinic): Promise<Clinic> {
    return this.clinicsRepository.save(clinic);
  }
}
