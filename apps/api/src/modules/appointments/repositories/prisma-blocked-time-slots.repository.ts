import { PrismaService } from '@/infra/database/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  BlockedTimeSlot as PrismaBlockedTimeSlot,
} from '@workspace/database';
import { BlockedTimeSlot } from '../entities/blocked-time-slot.entity';
import type { FindBlockedTimeSlotsFilters } from '../types/blocked-time-slot-filters.types';
import { BlockedTimeSlotsRepository } from './blocked-time-slots.repository';

/**
 * Prisma implementation of the BlockedTimeSlotsRepository.
 * Handles all blocked time slot database operations using Prisma ORM.
 */
@Injectable()
export class PrismaBlockedTimeSlotsRepository extends BlockedTimeSlotsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /** @inheritdoc */
  async findById(id: string): Promise<BlockedTimeSlot | null> {
    const blockedTimeSlot = await this.prisma.client.blockedTimeSlot.findUnique(
      {
        where: { id },
      },
    );

    if (!blockedTimeSlot) {
      return null;
    }

    return this.mapToEntity(blockedTimeSlot);
  }

  /** @inheritdoc */
  async findByFilters(
    filters: FindBlockedTimeSlotsFilters,
  ): Promise<BlockedTimeSlot[]> {
    const { providerId, locationId, startDate, endDate } = filters;

    // Build where clause
    const where: Prisma.BlockedTimeSlotWhereInput = {
      providerId,
    };

    // Location filter - include both specific location and null (all locations)
    if (locationId) {
      where.OR = [{ locationId }, { locationId: null }];
    }

    // Date range filter
    if (startDate && endDate) {
      where.AND = [
        { endDatetime: { gte: startDate } },
        { startDatetime: { lte: endDate } },
      ];
    } else if (startDate) {
      where.endDatetime = { gte: startDate };
    } else if (endDate) {
      where.startDatetime = { lte: endDate };
    }

    const blockedTimeSlots = await this.prisma.client.blockedTimeSlot.findMany({
      where,
      orderBy: {
        startDatetime: 'asc',
      },
    });

    return blockedTimeSlots.map((slot) => this.mapToEntity(slot));
  }

  /** @inheritdoc */
  async create(data: BlockedTimeSlot): Promise<BlockedTimeSlot> {
    const createdBlockedTimeSlot =
      await this.prisma.client.blockedTimeSlot.create({
        data: {
          id: data.id,
          providerId: data.providerId,
          locationId: data.locationId,
          startDatetime: data.startDatetime,
          endDatetime: data.endDatetime,
          reason: data.reason,
          createdById: data.createdById,
        },
      });

    return this.mapToEntity(createdBlockedTimeSlot);
  }

  /** @inheritdoc */
  async delete(id: string): Promise<void> {
    await this.prisma.client.blockedTimeSlot.delete({
      where: { id },
    });
  }

  /** @inheritdoc */
  async hasOverlappingBlock(
    providerId: string,
    start: Date,
    end: Date,
    locationId?: string,
  ): Promise<boolean> {
    const overlappingBlock = await this.prisma.client.blockedTimeSlot.findFirst(
      {
        where: {
          providerId,
          // Include blocks for the specific location or for all locations (null)
          ...(locationId
            ? {
                OR: [{ locationId }, { locationId: null }],
              }
            : {}),
          AND: [{ startDatetime: { lt: end } }, { endDatetime: { gt: start } }],
        },
      },
    );

    return !!overlappingBlock;
  }

  /** @inheritdoc */
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
