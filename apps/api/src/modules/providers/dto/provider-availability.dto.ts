import { z } from 'zod';

/**
 * Query parameter schema for provider availability endpoint.
 */
export const providerAvailabilityQuerySchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'endDate must be after or equal to startDate',
    path: ['endDate'],
  });

export type ProviderAvailabilityQueryDto = z.infer<
  typeof providerAvailabilityQuerySchema
>;

/**
 * A single time slot with start and end times in ISO format.
 */
export interface TimeSlot {
  start: string;
  end: string;
}

/**
 * Availability for a single day.
 */
export interface DayAvailability {
  date: string;
  dayOfWeek: number;
  slots: TimeSlot[];
}

/**
 * Response DTO for provider availability endpoint.
 */
export interface ProviderAvailabilityResponseDto {
  providerId: string;
  providerName: string;
  defaultAppointmentDuration: number;
  timezone: string;
  availability: DayAvailability[];
}
