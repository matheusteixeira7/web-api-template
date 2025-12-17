import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import {
  ProvidersApi,
  type ProvidersApi as ProvidersApiType,
} from '@/shared/public-api/interface/providers-api.interface';
import { Inject, Injectable } from '@nestjs/common';
import type { DeleteBlockedTimeSlotInputDto } from '../dto/blocked-time-slot.dto';
import { BlockedTimeSlotsRepository } from '../repositories/blocked-time-slots.repository';

/**
 * Use case for deleting a blocked time slot.
 */
@Injectable()
export class DeleteBlockedTimeSlotUseCase {
  constructor(
    private readonly blockedTimeSlotsRepository: BlockedTimeSlotsRepository,
    @Inject(ProvidersApi)
    private readonly providersApi: ProvidersApiType,
  ) {}

  /**
   * Executes the blocked time slot deletion operation.
   *
   * @param input - The deletion data
   * @throws ResourceNotFoundError if blocked time slot not found or doesn't belong to clinic
   */
  async execute(input: DeleteBlockedTimeSlotInputDto): Promise<void> {
    const { blockedTimeSlotId, clinicId } = input;

    // Find blocked time slot
    const blockedTimeSlot =
      await this.blockedTimeSlotsRepository.findById(blockedTimeSlotId);
    if (!blockedTimeSlot) {
      throw new ResourceNotFoundError();
    }

    // Validate provider belongs to clinic
    const provider = await this.providersApi.findById(
      blockedTimeSlot.providerId,
    );
    if (!provider || provider.clinicId !== clinicId) {
      throw new ResourceNotFoundError();
    }

    await this.blockedTimeSlotsRepository.delete(blockedTimeSlotId);
  }
}
