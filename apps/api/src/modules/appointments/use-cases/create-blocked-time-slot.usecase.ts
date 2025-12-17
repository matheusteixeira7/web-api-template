import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import {
  ProvidersApi,
  type ProvidersApi as ProvidersApiType,
} from '@/shared/public-api/interface/providers-api.interface';
import { Inject, Injectable } from '@nestjs/common';
import type {
  CreateBlockedTimeSlotInputDto,
  CreateBlockedTimeSlotResponseDto,
} from '../dto/blocked-time-slot.dto';
import { BlockedTimeSlot } from '../entities/blocked-time-slot.entity';
import { BlockedTimeSlotsRepository } from '../repositories/blocked-time-slots.repository';

/**
 * Use case for creating a blocked time slot.
 */
@Injectable()
export class CreateBlockedTimeSlotUseCase {
  constructor(
    private readonly blockedTimeSlotsRepository: BlockedTimeSlotsRepository,
    @Inject(ProvidersApi)
    private readonly providersApi: ProvidersApiType,
  ) {}

  /**
   * Executes the blocked time slot creation operation.
   *
   * @param input - The blocked time slot creation data
   * @returns The created blocked time slot entity
   * @throws ResourceNotFoundError if provider not found
   */
  async execute(
    input: CreateBlockedTimeSlotInputDto,
  ): Promise<CreateBlockedTimeSlotResponseDto> {
    const {
      clinicId,
      providerId,
      locationId,
      startDatetime,
      endDatetime,
      reason,
      createdById,
    } = input;

    // Validate provider exists and belongs to clinic
    const provider = await this.providersApi.findById(providerId);
    if (!provider || provider.clinicId !== clinicId) {
      throw new ResourceNotFoundError();
    }

    // Create blocked time slot
    const blockedTimeSlot = new BlockedTimeSlot({
      providerId,
      locationId: locationId ?? null,
      startDatetime,
      endDatetime,
      reason: reason ?? null,
      createdById: createdById ?? null,
    });

    const createdBlockedTimeSlot =
      await this.blockedTimeSlotsRepository.create(blockedTimeSlot);

    return {
      blockedTimeSlot: createdBlockedTimeSlot,
    };
  }
}
