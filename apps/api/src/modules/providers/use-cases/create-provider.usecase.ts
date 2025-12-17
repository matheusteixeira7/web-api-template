import { Injectable } from '@nestjs/common';
import type {
  CreateProviderInputDto,
  CreateProviderResponseDto,
} from '../dto/create-provider.dto';
import { Provider } from '../entities/provider.entity';
import { ProvidersRepository } from '../repositories/providers.repository';

/**
 * Default working hours for new providers.
 * Monday to Friday, 08:00 to 18:00.
 * Keys: "0" = Sunday, "1" = Monday, ... "6" = Saturday
 */
const DEFAULT_WORKING_HOURS: Record<string, { start: string; end: string }> = {
  '1': { start: '08:00', end: '18:00' }, // Monday
  '2': { start: '08:00', end: '18:00' }, // Tuesday
  '3': { start: '08:00', end: '18:00' }, // Wednesday
  '4': { start: '08:00', end: '18:00' }, // Thursday
  '5': { start: '08:00', end: '18:00' }, // Friday
};

/**
 * Use case for creating a new provider.
 *
 * @remarks
 * Creates a new provider entity associated with a clinic and
 * persists it to the database. If no working hours are provided,
 * defaults to Monday-Friday 08:00-18:00.
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
      workingHours: workingHours ?? DEFAULT_WORKING_HOURS,
    });

    const createdProvider =
      await this.providersRepository.create(providerEntity);

    return {
      provider: createdProvider,
    };
  }
}
