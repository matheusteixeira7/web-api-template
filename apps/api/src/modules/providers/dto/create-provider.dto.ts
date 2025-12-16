import { z } from 'zod';
import type { Provider } from '../entities/provider.entity';

/**
 * Zod schema for validating the create provider HTTP request body.
 *
 * @property name - Provider's display name (min 1 character)
 * @property specialty - Optional medical specialty
 * @property defaultAppointmentDuration - Default appointment duration in minutes
 * @property workingHours - Optional working schedule per day/location
 * @property userId - Optional linked user account UUID
 */
export const createProviderBodySchema = z.object({
  name: z.string().min(1),
  specialty: z.string().optional(),
  defaultAppointmentDuration: z.number().int().positive().default(30),
  workingHours: z.record(z.unknown()).optional(),
  userId: z.string().uuid().optional(),
});

/** Inferred type from the create provider body schema */
export type CreateProviderBodyDto = z.infer<typeof createProviderBodySchema>;

/**
 * Zod schema for the use case input, extending body schema with clinic context.
 *
 * @property clinicId - The clinic's unique identifier
 */
export const createProviderSchema = createProviderBodySchema.extend({
  clinicId: z.string().uuid(),
});

/** Inferred type from the create provider schema */
export type CreateProviderInputDto = z.infer<typeof createProviderSchema>;

/** Response DTO containing the created provider entity */
export interface CreateProviderResponseDto {
  provider: Provider;
}
