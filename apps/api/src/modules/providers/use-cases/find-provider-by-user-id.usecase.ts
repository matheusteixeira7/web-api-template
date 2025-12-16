import { Injectable } from '@nestjs/common';
import { Provider } from '../entities/provider.entity';
import { ProvidersRepository } from '../repositories/providers.repository';

/**
 * Use case for finding a provider by their linked user account.
 *
 * @remarks
 * This is used to check if a user is also a provider in the system.
 */
@Injectable()
export class FindProviderByUserIdUseCase {
  constructor(private readonly providersRepository: ProvidersRepository) {}

  /**
   * Finds a provider by their linked user ID.
   *
   * @param userId - The user's unique identifier
   * @returns The provider entity if found, null otherwise
   */
  async execute(userId: string): Promise<Provider | null> {
    return this.providersRepository.findByUserId(userId);
  }
}
