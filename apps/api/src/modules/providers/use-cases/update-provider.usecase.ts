import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import { ForbiddenException, Injectable } from '@nestjs/common';
import type {
  UpdateProviderInputDto,
  UpdateProviderResponseDto,
} from '../dto/update-provider.dto';
import { ProvidersRepository } from '../repositories/providers.repository';

/**
 * Use case for updating an existing provider.
 *
 * @remarks
 * Updates provider fields and persists changes to the database.
 * Validates that the provider belongs to the specified clinic.
 */
@Injectable()
export class UpdateProviderUseCase {
  constructor(private readonly providersRepository: ProvidersRepository) {}

  /**
   * Executes the provider update operation.
   *
   * @param input - The provider update data including identifiers
   * @returns The updated provider entity
   * @throws {ResourceNotFoundError} If provider is not found
   * @throws {ForbiddenException} If provider doesn't belong to the clinic
   */
  async execute({
    providerId,
    clinicId,
    name,
    specialty,
    defaultAppointmentDuration,
    workingHours,
    userId,
  }: UpdateProviderInputDto): Promise<UpdateProviderResponseDto> {
    const provider = await this.providersRepository.findById(providerId);

    if (!provider) {
      throw new ResourceNotFoundError();
    }

    if (provider.clinicId !== clinicId) {
      throw new ForbiddenException(
        'Provider does not belong to the specified clinic',
      );
    }

    // Update only provided fields
    if (name !== undefined) {
      provider.name = name;
    }
    if (specialty !== undefined) {
      provider.specialty = specialty;
    }
    if (defaultAppointmentDuration !== undefined) {
      provider.defaultAppointmentDuration = defaultAppointmentDuration;
    }
    if (workingHours !== undefined) {
      provider.workingHours = workingHours;
    }
    if (userId !== undefined) {
      provider.userId = userId;
    }

    const updatedProvider = await this.providersRepository.save(provider);

    return {
      provider: updatedProvider,
    };
  }
}
