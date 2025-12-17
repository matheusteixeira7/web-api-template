import type { AppointmentStatus } from '../entities/appointment.entity';

/**
 * Allowed values for appointment status filter.
 */
export const appointmentStatusFilterValues = [
  'all',
  'SCHEDULED',
  'CONFIRMED',
  'CHECKED_IN',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED',
] as const;
export type AppointmentStatusFilter =
  (typeof appointmentStatusFilterValues)[number];

/**
 * Allowed values for sort column.
 */
export const sortByValues = [
  'appointmentStart',
  'patientName',
  'providerName',
  'status',
  'createdAt',
] as const;
export type SortByColumn = (typeof sortByValues)[number];

/**
 * Allowed values for sort direction.
 */
export const sortDirValues = ['asc', 'desc'] as const;
export type SortDirection = (typeof sortDirValues)[number];

/**
 * Filters for finding appointments with pagination.
 */
export interface FindAppointmentsFilters {
  startDate?: Date;
  endDate?: Date;
  status: AppointmentStatusFilter;
  providerId?: string;
  patientId?: string;
  locationId?: string;
  sortBy: SortByColumn;
  sortDir: SortDirection;
  page: number;
  perPage: number;
}

/**
 * Input parameters for finding appointments by clinic with filters.
 */
export interface FindAppointmentsByClinicInput {
  clinicId: string;
  startDate?: Date;
  endDate?: Date;
  status?: AppointmentStatusFilter;
  providerId?: string;
  patientId?: string;
  locationId?: string;
  sortBy?: SortByColumn;
  sortDir?: SortDirection;
  page?: number;
  perPage?: number;
}

/**
 * Input parameters for finding appointments by provider.
 */
export interface FindAppointmentsByProviderInput {
  providerId: string;
  clinicId: string;
  startDate?: Date;
  endDate?: Date;
  status?: AppointmentStatusFilter;
  sortBy?: SortByColumn;
  sortDir?: SortDirection;
  page?: number;
  perPage?: number;
}

/**
 * Valid status transitions for appointments.
 * Used to validate status change requests.
 */
export const validStatusTransitions: Record<
  AppointmentStatus,
  AppointmentStatus[]
> = {
  SCHEDULED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CHECKED_IN', 'NO_SHOW', 'CANCELLED'],
  CHECKED_IN: ['COMPLETED', 'NO_SHOW'],
  COMPLETED: [],
  NO_SHOW: [],
  CANCELLED: [],
};
