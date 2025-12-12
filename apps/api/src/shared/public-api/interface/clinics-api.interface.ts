import { Clinic } from '@/modules/clinics/entities/clinic.entity';

/**
 * Public API contract for Clinics module
 *
 * This interface defines all operations that external modules can perform
 * on the Clinics module. It serves as the explicit communication contract
 * following the Facade Pattern.
 *
 * Usage:
 * - External modules inject via Symbol token: @Inject(ClinicsApi)
 * - Never import concrete implementations (ClinicsFacade, repositories)
 * - This enables polymorphism: swap ClinicsFacade ↔ ClinicsHttpClient
 */
export interface ClinicsApi {
  /**
   * Find clinic by ID
   * @param id Clinic unique identifier
   * @returns Clinic entity or null if not found
   */
  findById(id: string): Promise<Clinic | null>;

  /**
   * Create a new clinic
   * @param data Clinic creation data
   * @returns Created clinic entity
   */
  createClinic(data: CreateClinicData): Promise<Clinic>;

  /**
   * Update an existing clinic
   * @param clinic Clinic entity with updated fields
   * @returns Updated clinic entity
   */
  updateClinic(clinic: Clinic): Promise<Clinic>;

  /**
   * Verify if a user belongs to a clinic (authorization check)
   *
   * This method demonstrates cross-module communication via facades.
   * It calls UsersApi.findById() to verify the relationship.
   *
   * @param userId User unique identifier
   * @param clinicId Clinic unique identifier
   * @returns True if user belongs to clinic, false otherwise
   */
  verifyUserBelongsToClinic(userId: string, clinicId: string): Promise<boolean>;
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
 *   constructor(@Inject(ClinicsApi) private clinicsApi: ClinicsApi) {}
 * }
 */
export const ClinicsApi = Symbol('ClinicsApi');

/**
 * DTO for creating a new clinic
 */
export interface CreateClinicData {
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  timezone?: string;
}
