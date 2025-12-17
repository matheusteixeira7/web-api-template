import { z } from 'zod';
import type { Appointment } from '../entities/appointment.entity';

/**
 * Zod schema for validating the update appointment HTTP request body.
 * All fields are optional for partial updates.
 */
export const updateAppointmentBodySchema = z
  .object({
    patientId: z.string().uuid().optional(),
    providerId: z.string().uuid().optional(),
    locationId: z.union([z.string().uuid(), z.null()]).optional(),
    appointmentStart: z.coerce.date().optional(),
    appointmentEnd: z.coerce.date().optional(),
    notes: z.union([z.string(), z.null()]).optional(),
  })
  .refine(
    (data) => {
      // If both are provided, end must be after start
      if (data.appointmentStart && data.appointmentEnd) {
        return data.appointmentEnd > data.appointmentStart;
      }
      return true;
    },
    {
      message: 'appointmentEnd must be after appointmentStart',
      path: ['appointmentEnd'],
    },
  );

/** Inferred type from the update appointment body schema */
export type UpdateAppointmentBodyDto = z.infer<
  typeof updateAppointmentBodySchema
>;

/**
 * Zod schema for the use case input, extending body schema with context.
 */
export const updateAppointmentSchema = updateAppointmentBodySchema.and(
  z.object({
    appointmentId: z.string().uuid(),
    clinicId: z.string().uuid(),
  }),
);

/** Inferred type from the update appointment schema */
export type UpdateAppointmentInputDto = z.infer<typeof updateAppointmentSchema>;

/** Response DTO containing the updated appointment entity */
export interface UpdateAppointmentResponseDto {
  appointment: Appointment;
}
