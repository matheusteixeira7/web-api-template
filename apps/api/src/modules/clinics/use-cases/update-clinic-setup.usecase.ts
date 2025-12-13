import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import { UsersApi } from '@/shared/public-api/interface/users-api.interface';
import type { BusinessHours } from '@/shared/types/business-hours.type';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type {
  UpdateClinicSetupInputDto,
  UpdateClinicSetupResponseDto,
} from '../dto/update-clinic-setup.dto';
import { ClinicsRepository } from '../repositories/clinics.repository';

/**
 * Use case responsible for updating the initial setup of a clinic.
 *
 * This use case allows authorized users to update information such as
 * name, contact details, business hours, timezone, and average appointment value.
 * Upon successful execution, it marks the clinic setup as complete.
 */
@Injectable()
export class UpdateClinicSetupUseCase {
  constructor(
    private readonly clinicsRepository: ClinicsRepository,
    @Inject(UsersApi) private readonly usersApi: UsersApi,
  ) {}

  /**
   * Executes the clinic setup update.
   *
   * @param data - Data for updating the clinic
   * @param data.clinicId - ID of the clinic to be updated
   * @param data.userId - ID of the user performing the update
   * @param data.name - New name of the clinic
   * @param data.contactPhone - Clinic contact phone number
   * @param data.contactEmail - Clinic contact email (optional)
   * @param data.businessHours - Clinic business hours
   * @param data.timezone - Clinic timezone
   * @param data.averageAppointmentValue - Average appointment value (optional)
   *
   * @returns Object containing the updated clinic
   *
   * @throws {ForbiddenException} When the user does not belong to the clinic
   * @throws {ResourceNotFoundError} When the clinic is not found
   */
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
}
