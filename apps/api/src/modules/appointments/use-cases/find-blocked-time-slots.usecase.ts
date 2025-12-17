import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import {
  ProvidersApi,
  type ProvidersApi as ProvidersApiType,
} from '@/shared/public-api/interface/providers-api.interface';
import { Inject, Injectable } from '@nestjs/common';
import type { FindBlockedTimeSlotsResponseDto } from '../dto/blocked-time-slot.dto';
import { BlockedTimeSlotsRepository } from '../repositories/blocked-time-slots.repository';
import type { FindBlockedTimeSlotsByProviderInput } from '../types/blocked-time-slot-filters.types';

/**
 * Use case for finding blocked time slots by provider.
 */
@Injectable()
export class FindBlockedTimeSlotsUseCase {
  constructor(
    private readonly blockedTimeSlotsRepository: BlockedTimeSlotsRepository,
    @Inject(ProvidersApi)
    private readonly providersApi: ProvidersApiType,
  ) {}

  /**
   * Executes the blocked time slots search operation.
   *
   * @param input - The search input with provider ID and optional filters
   * @returns Array of blocked time slot entities
   * @throws ResourceNotFoundError if provider not found or doesn't belong to clinic
   */
  async execute(
    input: FindBlockedTimeSlotsByProviderInput,
  ): Promise<FindBlockedTimeSlotsResponseDto> {
    const { providerId, clinicId, locationId, startDate, endDate } = input;

    // Validate provider exists and belongs to clinic
    const provider = await this.providersApi.findById(providerId);
    if (!provider || provider.clinicId !== clinicId) {
      throw new ResourceNotFoundError();
    }

    const blockedTimeSlots =
      await this.blockedTimeSlotsRepository.findByFilters({
        providerId,
        locationId,
        startDate,
        endDate,
      });

    return {
      blockedTimeSlots,
    };
  }
}
