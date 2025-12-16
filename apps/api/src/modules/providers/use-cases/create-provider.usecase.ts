import { Injectable } from '@nestjs/common';
import type {
  CreateProviderInputDto,
  CreateProviderResponseDto,
} from '../dto/create-provider.dto';
import { Provider } from '../entities/provider.entity';
import { ProvidersRepository } from '../repositories/providers.repository';

/**
 * Use case for creating a new provider.
 *
 * @remarks
 * Creates a new provider entity associated with a clinic and
 * persists it to the database.
 */
@Injectable()
export class CreateProviderUseCase {
  constructor(private readonly providersRepository: ProvidersRepository) {}

  /**
   * Executes the provider creation operation.
   *
   * @param input - The provider creation data
   * @returns The created provider entity
   */
  async execute({
    clinicId,
    userId,
    name,
    specialty,
    defaultAppointmentDuration,
    workingHours,
  }: CreateProviderInputDto): Promise<CreateProviderResponseDto> {
    const providerEntity = new Provider({
      clinicId,
      userId,
      name,
      specialty,
      defaultAppointmentDuration,
      workingHours,
    });

    const createdProvider =
      await this.providersRepository.create(providerEntity);

    return {
      provider: createdProvider,
    };
  }
}
