import { z } from 'zod';
import type { Appointment } from '../entities/appointment.entity';
import {
  appointmentStatusFilterValues,
  sortByValues,
  sortDirValues,
} from '../types/appointment-filters.types';

/**
 * Zod schema for validating find appointments query parameters.
 */
export const findAppointmentsQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.enum(appointmentStatusFilterValues).default('all'),
  providerId: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  sortBy: z.enum(sortByValues).default('appointmentStart'),
  sortDir: z.enum(sortDirValues).default('asc'),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10),
});

/**
 * Output type from the find appointments query schema.
 * Uses z.output to get the type after defaults are applied.
 */
export type FindAppointmentsQueryDto = z.output<
  typeof findAppointmentsQuerySchema
>;

/**
 * Zod schema for find appointments by provider query parameters.
 */
export const findAppointmentsByProviderQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.enum(appointmentStatusFilterValues).default('all'),
  sortBy: z.enum(sortByValues).default('appointmentStart'),
  sortDir: z.enum(sortDirValues).default('asc'),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10),
});

/**
 * Output type from the find appointments by provider query schema.
 */
export type FindAppointmentsByProviderQueryDto = z.output<
  typeof findAppointmentsByProviderQuerySchema
>;

/** Response DTO containing a single appointment entity */
export interface FindAppointmentResponseDto {
  appointment: Appointment;
}

/** Response DTO containing a list of appointment entities */
export interface FindAppointmentsResponseDto {
  appointments: Appointment[];
}

/** Paginated response DTO for appointments list */
export interface FindAppointmentsPaginatedResponseDto {
  appointments: Appointment[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
