import type { FindPatientsPaginatedResponseDto } from '@/modules/patients/dto/find-patient.dto';
import { Patient } from '@/modules/patients/entities/patient.entity';
import type { FindPatientsFilters } from '@/modules/patients/types/patient-filters.types';

/**
 * Public API contract for Patients module
 *
 * This interface defines all operations that external modules can perform
 * on the Patients module. It serves as the explicit communication contract
 * following the Facade Pattern.
 *
 * Usage:
 * - External modules inject via Symbol token: @Inject(PatientsApi)
 * - Never import concrete implementations (PatientsFacade, repositories)
 * - This enables polymorphism: swap PatientsFacade ↔ PatientsHttpClient
 */
export interface PatientsApi {
  /**
   * Find patient by ID within a specific clinic
   * @param id Patient unique identifier
   * @param clinicId Clinic unique identifier for access control
   * @returns Patient entity or null if not found or doesn't belong to clinic
   */
  findById(id: string, clinicId: string): Promise<Patient | null>;

  /**
   * Find all patients belonging to a clinic with optional filters
   * @param clinicId Clinic unique identifier
   * @param filters Optional filter, sort, and pagination options
   * @returns Paginated response with patients and total count
   */
  findByClinicId(
    clinicId: string,
    filters?: Partial<FindPatientsFilters>,
  ): Promise<FindPatientsPaginatedResponseDto>;

  /**
   * Find patient by phone number within a clinic
   * @param clinicId Clinic unique identifier
   * @param phone Patient phone number
   * @returns Patient entity or null if not found
   */
  findByPhone(clinicId: string, phone: string): Promise<Patient | null>;
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
 *   constructor(@Inject(PatientsApi) private patientsApi: PatientsApi) {}
 * }
 */
export const PatientsApi = Symbol('PatientsApi');
