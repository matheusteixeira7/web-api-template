import type { BlockedTimeSlot as PrismaBlockedTimeSlot } from '@workspace/database';
import type { BlockedTimeSlot } from '../entities/blocked-time-slot.entity';
import type { FindBlockedTimeSlotsFilters } from '../types/blocked-time-slot-filters.types';

/**
 * Abstract repository interface for blocked time slot data access.
 *
 * @remarks
 * This defines the contract for blocked time slot persistence operations.
 * Implementations handle the actual database interactions.
 * Following the Repository Pattern for data access abstraction.
 */
export abstract class BlockedTimeSlotsRepository {
  /**
   * Finds a blocked time slot by its unique identifier.
   * @param id - The blocked time slot's UUID
   * @returns The blocked time slot entity if found, null otherwise
   */
  abstract findById(id: string): Promise<BlockedTimeSlot | null>;

  /**
   * Finds blocked time slots for a provider with optional filters.
   * @param filters - Filter options including providerId, locationId, date range
   * @returns Array of blocked time slot entities
   */
  abstract findByFilters(
    filters: FindBlockedTimeSlotsFilters,
  ): Promise<BlockedTimeSlot[]>;

  /**
   * Creates a new blocked time slot in the database.
   * @param data - The blocked time slot entity to persist
   * @returns The created blocked time slot entity
   */
  abstract create(data: BlockedTimeSlot): Promise<BlockedTimeSlot>;

  /**
   * Deletes a blocked time slot from the database.
   * @param id - The blocked time slot's UUID
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Checks if there's a blocked time slot overlapping with the given time range.
   * @param providerId - The provider's UUID
   * @param start - Start time of the slot
   * @param end - End time of the slot
   * @param locationId - Optional location to check (null checks all locations)
   * @returns True if there's a blocking slot, false otherwise
   */
  abstract hasOverlappingBlock(
    providerId: string,
    start: Date,
    end: Date,
    locationId?: string,
  ): Promise<boolean>;

  /**
   * Maps a Prisma blocked time slot record to a BlockedTimeSlot domain entity.
   * @param blockedTimeSlot - The Prisma blocked time slot record
   * @returns The mapped BlockedTimeSlot entity
   */
  abstract mapToEntity(blockedTimeSlot: PrismaBlockedTimeSlot): BlockedTimeSlot;
}
