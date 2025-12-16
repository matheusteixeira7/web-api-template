import { Injectable } from '@nestjs/common';
import { Provider } from '../entities/provider.entity';
import { ProvidersRepository } from '../repositories/providers.repository';

/**
 * Use case for finding a provider by their unique identifier.
 *
 * @remarks
 * This is a simple lookup use case that returns the provider entity.
 */
@Injectable()
export class FindProviderByIdUseCase {
  constructor(private readonly providersRepository: ProvidersRepository) {}

  /**
   * Finds a provider by their ID.
   *
   * @param id - The provider's unique identifier
   * @returns The provider entity if found, null otherwise
   */
  async execute(id: string): Promise<Provider | null> {
    return this.providersRepository.findById(id);
  }
}
