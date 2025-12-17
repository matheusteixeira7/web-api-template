import { z } from 'zod';
import type { Appointment } from '../entities/appointment.entity';

/**
 * Zod schema for validating the cancel appointment HTTP request body.
 *
 * @property notes - Optional notes about why the appointment was cancelled
 */
export const cancelAppointmentBodySchema = z.object({
  notes: z.string().optional(),
});

/** Inferred type from the cancel appointment body schema */
export type CancelAppointmentBodyDto = z.infer<typeof cancelAppointmentBodySchema>;

/**
 * Zod schema for the use case input, extending body schema with identifiers.
 *
 * @property appointmentId - The appointment's unique identifier
 * @property clinicId - The clinic's unique identifier (for authorization)
 * @property cancelledById - The user who cancelled the appointment
 * @property notes - Optional notes about why the appointment was cancelled
 */
export const cancelAppointmentSchema = z.object({
  appointmentId: z.string().uuid(),
  clinicId: z.string().uuid(),
  cancelledById: z.string().uuid().optional(),
  notes: z.string().optional(),
});

/** Inferred type from the cancel appointment schema */
export type CancelAppointmentInputDto = z.infer<typeof cancelAppointmentSchema>;

/** Response DTO containing the cancelled appointment entity */
export interface CancelAppointmentResponseDto {
  appointment: Appointment;
}
