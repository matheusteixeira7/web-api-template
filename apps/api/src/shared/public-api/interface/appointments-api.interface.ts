import type { FindAppointmentsPaginatedResponseDto } from '@/modules/appointments/dto/find-appointment.dto';
import type { Appointment } from '@/modules/appointments/entities/appointment.entity';
import type { BlockedTimeSlot } from '@/modules/appointments/entities/blocked-time-slot.entity';
import type { FindAppointmentsFilters } from '@/modules/appointments/types/appointment-filters.types';

/**
 * Public API contract for Appointments module
 *
 * This interface defines all operations that external modules can perform
 * on the Appointments module. It serves as the explicit communication contract
 * following the Facade Pattern.
 *
 * Usage:
 * - External modules inject via Symbol token: @Inject(AppointmentsApi)
 * - Never import concrete implementations (AppointmentsFacade, repositories)
 * - This enables polymorphism: swap AppointmentsFacade ↔ AppointmentsHttpClient
 */
export interface AppointmentsApi {
  /**
   * Find appointment by ID within a specific clinic
   * @param id Appointment unique identifier
   * @param clinicId Clinic unique identifier for access control
   * @returns Appointment entity or null if not found
   */
  findById(id: string, clinicId: string): Promise<Appointment | null>;

  /**
   * Find all appointments belonging to a clinic with optional filters
   * @param clinicId Clinic unique identifier
   * @param filters Optional filter, sort, and pagination options
   * @returns Paginated response with appointments and total count
   */
  findByClinicId(
    clinicId: string,
    filters?: Partial<FindAppointmentsFilters>,
  ): Promise<FindAppointmentsPaginatedResponseDto>;

  /**
   * Find all appointments for a specific provider with optional filters
   * @param providerId Provider unique identifier
   * @param clinicId Clinic unique identifier for access control
   * @param filters Optional filter, sort, and pagination options
   * @returns Paginated response with appointments and total count
   */
  findByProviderId(
    providerId: string,
    clinicId: string,
    filters?: Partial<FindAppointmentsFilters>,
  ): Promise<FindAppointmentsPaginatedResponseDto>;

  /**
   * Find all appointments for a specific patient with optional filters
   * @param patientId Patient unique identifier
   * @param clinicId Clinic unique identifier for access control
   * @param filters Optional filter, sort, and pagination options
   * @returns Paginated response with appointments and total count
   */
  findByPatientId(
    patientId: string,
    clinicId: string,
    filters?: Partial<FindAppointmentsFilters>,
  ): Promise<FindAppointmentsPaginatedResponseDto>;

  /**
   * Find appointments for a provider within a date range (for availability calculation)
   * @param providerId Provider unique identifier
   * @param clinicId Clinic unique identifier for access control
   * @param startDate Start of the date range
   * @param endDate End of the date range
   * @returns Array of appointments within the date range
   */
  findByProviderForDateRange(
    providerId: string,
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]>;

  /**
   * Find blocked time slots for a provider within a date range
   * @param providerId Provider unique identifier
   * @param startDate Start of the date range
   * @param endDate End of the date range
   * @returns Array of blocked time slots within the date range
   */
  findBlockedSlotsByProvider(
    providerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<BlockedTimeSlot[]>;
}

/**
 * Symbol token for dependency injection
 *
 * This Symbol is used as the DI token instead of the class name,
 * preventing naming collisions and enabling polymorphic implementations.
 *
 * Example:
 * @Injectable()
 * export class SomeService {
 *   constructor(@Inject(AppointmentsApi) private appointmentsApi: AppointmentsApi) {}
 * }
 */
export const AppointmentsApi = Symbol('AppointmentsApi');
