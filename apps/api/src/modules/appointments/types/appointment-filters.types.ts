import {
  appointmentStatusValues,
  type AppointmentStatus,
} from './appointment-status.types';

// Re-export for convenience
export type { AppointmentStatus };
export { appointmentStatusValues };

/**
 * Allowed values for appointment status filter (includes 'all' option).
 */
export const appointmentStatusFilterValues = [
  'all',
  ...appointmentStatusValues,
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
 * Input parameters for finding appointments by patient.
 */
export interface FindAppointmentsByPatientInput {
  patientId: string;
  clinicId: string;
  startDate?: Date;
  endDate?: Date;
  status?: AppointmentStatusFilter;
  sortBy?: SortByColumn;
  sortDir?: SortDirection;
  page?: number;
  perPage?: number;
}

// Re-export validStatusTransitions from the central status types
export { validStatusTransitions } from './appointment-status.types';
