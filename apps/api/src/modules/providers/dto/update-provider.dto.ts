import { z } from 'zod';
import type { Provider } from '../entities/provider.entity';

/**
 * Zod schema for validating the update provider HTTP request body.
 * All fields are optional for partial updates.
 *
 * @property name - Provider's display name (min 1 character)
 * @property specialty - Medical specialty
 * @property defaultAppointmentDuration - Default appointment duration in minutes
 * @property workingHours - Working schedule per day/location
 * @property userId - Linked user account UUID (can be set to null)
 */
export const updateProviderBodySchema = z.object({
  name: z.string().min(1).optional(),
  specialty: z.string().nullable().optional(),
  defaultAppointmentDuration: z.number().int().positive().optional(),
  workingHours: z.record(z.unknown()).nullable().optional(),
  userId: z.string().uuid().nullable().optional(),
});

/** Inferred type from the update provider body schema */
export type UpdateProviderBodyDto = z.infer<typeof updateProviderBodySchema>;

/**
 * Zod schema for the use case input, extending body schema with identifiers.
 *
 * @property providerId - The provider's unique identifier
 * @property clinicId - The clinic's unique identifier (for authorization)
 */
export const updateProviderSchema = updateProviderBodySchema.extend({
  providerId: z.string().uuid(),
  clinicId: z.string().uuid(),
});

/** Inferred type from the update provider schema */
export type UpdateProviderInputDto = z.infer<typeof updateProviderSchema>;

/** Response DTO containing the updated provider entity */
export interface UpdateProviderResponseDto {
  provider: Provider;
}
