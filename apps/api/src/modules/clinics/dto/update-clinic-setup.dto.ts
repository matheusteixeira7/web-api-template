import { z } from 'zod';
import type { Clinic } from '../entities/clinic.entity';

/**
 * Zod schema for validating the update clinic setup HTTP request body.
 *
 * @property name - Clinic display name (min 1 character)
 * @property contactPhone - Contact phone number (min 10 characters)
 * @property contactEmail - Optional contact email address
 * @property businessHours - Operating hours for each day of the week
 * @property timezone - IANA timezone identifier
 * @property averageAppointmentValue - Optional average appointment value in BRL cents
 */
export const updateClinicSetupBodySchema = z.object({
  name: z.string().min(1),
  contactPhone: z.string().min(10),
  contactEmail: z.string().email().optional(),
  businessHours: z.record(
    z.object({
      start: z.string(),
      end: z.string(),
      closed: z.boolean(),
    }),
  ),
  timezone: z.string(),
  averageAppointmentValue: z.number().positive().optional(),
});

/** Inferred type from the update clinic setup body schema */
export type UpdateClinicSetupBodyDto = z.infer<
  typeof updateClinicSetupBodySchema
>;

/**
 * Zod schema for the use case input, extending body schema with user context.
 *
 * @property clinicId - The clinic's unique identifier
 * @property userId - The authenticated user's unique identifier
 */
export const updateClinicSetupSchema = updateClinicSetupBodySchema.extend({
  clinicId: z.string().uuid(),
  userId: z.string().uuid(),
});

/** Inferred type from the update clinic setup schema */
export type UpdateClinicSetupInputDto = z.infer<typeof updateClinicSetupSchema>;

/** Response DTO containing the updated clinic entity */
export interface UpdateClinicSetupResponseDto {
  clinic: Clinic;
}
