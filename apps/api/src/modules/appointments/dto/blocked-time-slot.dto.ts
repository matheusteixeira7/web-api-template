import { z } from 'zod';
import type { BlockedTimeSlot } from '../entities/blocked-time-slot.entity';

/**
 * Zod schema for validating the create blocked time slot HTTP request body.
 */
export const createBlockedTimeSlotBodySchema = z
  .object({
    providerId: z.string().uuid(),
    locationId: z.string().uuid().optional(),
    startDatetime: z.coerce.date(),
    endDatetime: z.coerce.date(),
    reason: z.string().optional(),
  })
  .refine((data) => data.endDatetime > data.startDatetime, {
    message: 'endDatetime must be after startDatetime',
    path: ['endDatetime'],
  });

/** Inferred type from the create blocked time slot body schema */
export type CreateBlockedTimeSlotBodyDto = z.infer<
  typeof createBlockedTimeSlotBodySchema
>;

/**
 * Zod schema for the use case input, extending body schema with context.
 */
export const createBlockedTimeSlotSchema = z
  .object({
    clinicId: z.string().uuid(),
    createdById: z.string().uuid().optional(),
    providerId: z.string().uuid(),
    locationId: z.string().uuid().optional(),
    startDatetime: z.coerce.date(),
    endDatetime: z.coerce.date(),
    reason: z.string().optional(),
  })
  .refine((data) => data.endDatetime > data.startDatetime, {
    message: 'endDatetime must be after startDatetime',
    path: ['endDatetime'],
  });

/** Inferred type from the create blocked time slot schema */
export type CreateBlockedTimeSlotInputDto = z.infer<
  typeof createBlockedTimeSlotSchema
>;

/** Response DTO containing the created blocked time slot entity */
export interface CreateBlockedTimeSlotResponseDto {
  blockedTimeSlot: BlockedTimeSlot;
}

/**
 * Zod schema for validating find blocked time slots query parameters.
 */
export const findBlockedTimeSlotsQuerySchema = z.object({
  providerId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

/**
 * Inferred type from the find blocked time slots query schema.
 */
export type FindBlockedTimeSlotsQueryDto = z.infer<
  typeof findBlockedTimeSlotsQuerySchema
>;

/** Response DTO containing a list of blocked time slot entities */
export interface FindBlockedTimeSlotsResponseDto {
  blockedTimeSlots: BlockedTimeSlot[];
}

/**
 * Zod schema for the delete blocked time slot use case input.
 *
 * @property blockedTimeSlotId - The blocked time slot's unique identifier
 * @property clinicId - The clinic's unique identifier (for authorization)
 */
export const deleteBlockedTimeSlotSchema = z.object({
  blockedTimeSlotId: z.string().uuid(),
  clinicId: z.string().uuid(),
});

/** Inferred type from the delete blocked time slot schema */
export type DeleteBlockedTimeSlotInputDto = z.infer<
  typeof deleteBlockedTimeSlotSchema
>;
