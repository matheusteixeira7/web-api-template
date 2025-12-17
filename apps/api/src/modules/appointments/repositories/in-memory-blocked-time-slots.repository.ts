import type { BlockedTimeSlot as PrismaBlockedTimeSlot } from '@workspace/database';
import { BlockedTimeSlot } from '../entities/blocked-time-slot.entity';
import type { FindBlockedTimeSlotsFilters } from '../types/blocked-time-slot-filters.types';
import { BlockedTimeSlotsRepository } from './blocked-time-slots.repository';

/**
 * In-memory implementation of BlockedTimeSlotsRepository for testing.
 */
export class InMemoryBlockedTimeSlotsRepository extends BlockedTimeSlotsRepository {
  public items: BlockedTimeSlot[] = [];

  findById(id: string): Promise<BlockedTimeSlot | null> {
    const item = this.items.find((item) => item.id === id);
    return Promise.resolve(item ?? null);
  }

  findByFilters(
    filters: FindBlockedTimeSlotsFilters,
  ): Promise<BlockedTimeSlot[]> {
    let filtered = this.items.filter(
      (item) => item.providerId === filters.providerId,
    );

    if (filters.locationId) {
      filtered = filtered.filter(
        (item) =>
          item.locationId === filters.locationId || item.locationId === null,
      );
    }

    if (filters.startDate) {
      const startDate = filters.startDate;
      filtered = filtered.filter((item) => item.endDatetime >= startDate);
    }

    if (filters.endDate) {
      const endDate = filters.endDate;
      filtered = filtered.filter((item) => item.startDatetime <= endDate);
    }

    return Promise.resolve(filtered);
  }

  create(data: BlockedTimeSlot): Promise<BlockedTimeSlot> {
    this.items.push(data);
    return Promise.resolve(data);
  }

  delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index >= 0) {
      this.items.splice(index, 1);
    }
    return Promise.resolve();
  }

  hasOverlappingBlock(
    providerId: string,
    start: Date,
    end: Date,
    locationId?: string,
  ): Promise<boolean> {
    const overlapping = this.items.find(
      (item) =>
        item.providerId === providerId &&
        (locationId === undefined ||
          item.locationId === null ||
          item.locationId === locationId) &&
        item.startDatetime < end &&
        item.endDatetime > start,
    );
    return Promise.resolve(!!overlapping);
  }

  mapToEntity(blockedTimeSlot: PrismaBlockedTimeSlot): BlockedTimeSlot {
    return new BlockedTimeSlot({
      id: blockedTimeSlot.id,
      providerId: blockedTimeSlot.providerId,
      locationId: blockedTimeSlot.locationId,
      startDatetime: blockedTimeSlot.startDatetime,
      endDatetime: blockedTimeSlot.endDatetime,
      reason: blockedTimeSlot.reason,
      createdById: blockedTimeSlot.createdById,
      createdAt: blockedTimeSlot.createdAt,
    });
  }
}
