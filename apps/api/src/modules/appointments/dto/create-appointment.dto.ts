import { z } from 'zod';
import type { Appointment } from '../entities/appointment.entity';

/**
 * Zod schema for validating the create appointment HTTP request body.
 */
export const createAppointmentBodySchema = z
  .object({
    patientId: z.string().uuid(),
    providerId: z.string().uuid(),
    locationId: z.string().uuid().optional(),
    appointmentStart: z.coerce.date(),
    appointmentEnd: z.coerce.date(),
    notes: z.string().optional(),
    bookingSource: z.enum(['MANUAL', 'PUBLIC_LINK', 'API']).default('MANUAL'),
  })
  .refine((data) => data.appointmentEnd > data.appointmentStart, {
    message: 'appointmentEnd must be after appointmentStart',
    path: ['appointmentEnd'],
  });

/** Inferred type from the create appointment body schema */
export type CreateAppointmentBodyDto = z.infer<
  typeof createAppointmentBodySchema
>;

/**
 * Zod schema for the use case input, extending body schema with context.
 */
export const createAppointmentSchema = z
  .object({
    clinicId: z.string().uuid(),
    createdById: z.string().uuid().optional(),
    patientId: z.string().uuid(),
    providerId: z.string().uuid(),
    locationId: z.string().uuid().optional(),
    appointmentStart: z.coerce.date(),
    appointmentEnd: z.coerce.date(),
    notes: z.string().optional(),
    bookingSource: z.enum(['MANUAL', 'PUBLIC_LINK', 'API']).default('MANUAL'),
  })
  .refine((data) => data.appointmentEnd > data.appointmentStart, {
    message: 'appointmentEnd must be after appointmentStart',
    path: ['appointmentEnd'],
  });

/** Inferred type from the create appointment schema */
export type CreateAppointmentInputDto = z.infer<typeof createAppointmentSchema>;

/** Response DTO containing the created appointment entity */
export interface CreateAppointmentResponseDto {
  appointment: Appointment;
}
