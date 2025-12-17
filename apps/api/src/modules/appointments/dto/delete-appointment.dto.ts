import { z } from 'zod';

/**
 * Zod schema for the delete appointment use case input.
 *
 * @property appointmentId - The appointment's unique identifier
 * @property clinicId - The clinic's unique identifier (for authorization)
 */
export const deleteAppointmentSchema = z.object({
  appointmentId: z.string().uuid(),
  clinicId: z.string().uuid(),
});

/** Inferred type from the delete appointment schema */
export type DeleteAppointmentInputDto = z.infer<typeof deleteAppointmentSchema>;
