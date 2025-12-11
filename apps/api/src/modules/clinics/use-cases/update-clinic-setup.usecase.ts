import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import type { BusinessHours } from '@/shared/types/business-hours.type';
import { ForbiddenException } from '@nestjs/common';
import { prisma } from '@workspace/database';
import type {
  UpdateClinicSetupInputDto,
  UpdateClinicSetupResponseDto,
} from '../dto/update-clinic-setup.dto';
import type { ClinicsRepository } from '../repositories/clinics.repository';

export class UpdateClinicSetupUseCase {
  constructor(private readonly clinicsRepository: ClinicsRepository) {}

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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { clinicId: true },
    });

    if (!user) {
      throw new ResourceNotFoundError();
    }

    if (user.clinicId !== clinicId) {
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
