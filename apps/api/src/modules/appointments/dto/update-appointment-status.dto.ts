import { z } from 'zod';
import type {
  Appointment,
  AppointmentStatus,
} from '../entities/appointment.entity';

/**
 * Valid appointment statuses for status updates.
 */
export const appointmentStatusValues = [
  'SCHEDULED',
  'CONFIRMED',
  'CHECKED_IN',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED',
] as const;

/**
 * Zod schema for validating the update appointment status HTTP request body.
 */
export const updateAppointmentStatusBodySchema = z.object({
  status: z.enum(appointmentStatusValues),
  notes: z.string().optional(),
});

/** Inferred type from the update appointment status body schema */
export type UpdateAppointmentStatusBodyDto = z.infer<
  typeof updateAppointmentStatusBodySchema
>;

/**
 * Zod schema for the use case input, extending body schema with context.
 */
export const updateAppointmentStatusSchema =
  updateAppointmentStatusBodySchema.extend({
    appointmentId: z.string().uuid(),
    clinicId: z.string().uuid(),
    changedById: z.string().uuid().optional(),
  });

/** Inferred type from the update appointment status schema */
export type UpdateAppointmentStatusInputDto = z.infer<
  typeof updateAppointmentStatusSchema
>;

/** Response DTO containing the updated appointment entity */
export interface UpdateAppointmentStatusResponseDto {
  appointment: Appointment;
  previousStatus: AppointmentStatus;
}
