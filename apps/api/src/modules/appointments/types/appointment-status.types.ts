/**
 * Single source of truth for appointment status values.
 * All status-related types and constants should be imported from this file.
 */

/**
 * Valid appointment status values as a const tuple.
 * Used for Zod validation schemas and type inference.
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
 * Appointment status type derived from the status values tuple.
 */
export type AppointmentStatus = (typeof appointmentStatusValues)[number];

/**
 * Valid status transitions for appointments.
 * Used to validate status change requests.
 *
 * @remarks
 * - SCHEDULED can transition to: CONFIRMED, CANCELLED
 * - CONFIRMED can transition to: CHECKED_IN, NO_SHOW, CANCELLED
 * - CHECKED_IN can transition to: COMPLETED, NO_SHOW
 * - COMPLETED, NO_SHOW, CANCELLED are terminal states
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

/**
 * Booking source values.
 */
export const bookingSourceValues = ['MANUAL', 'PUBLIC_LINK', 'API'] as const;

/**
 * Booking source type derived from the booking source values tuple.
 */
export type BookingSource = (typeof bookingSourceValues)[number];
