import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ProvidersRepository } from '../repositories/providers.repository';

/**
 * Input DTO for deleting a provider.
 */
export interface DeleteProviderInputDto {
  /** The provider's unique identifier */
  providerId: string;
  /** The clinic's unique identifier (for authorization) */
  clinicId: string;
}

/**
 * Use case for soft-deleting a provider.
 *
 * @remarks
 * Performs a soft delete by setting the deletedAt timestamp.
 * Validates that the provider belongs to the specified clinic.
 */
@Injectable()
export class DeleteProviderUseCase {
  constructor(private readonly providersRepository: ProvidersRepository) {}

  /**
   * Executes the provider deletion operation.
   *
   * @param input - The provider deletion data including identifiers
   * @throws {ResourceNotFoundError} If provider is not found
   * @throws {ForbiddenException} If provider doesn't belong to the clinic
   */
  async execute({
    providerId,
    clinicId,
  }: DeleteProviderInputDto): Promise<void> {
    const provider = await this.providersRepository.findById(providerId);

    if (!provider) {
      throw new ResourceNotFoundError();
    }

    if (provider.clinicId !== clinicId) {
      throw new ForbiddenException(
        'Provider does not belong to the specified clinic',
      );
    }

    await this.providersRepository.softDelete(providerId);
  }
}
