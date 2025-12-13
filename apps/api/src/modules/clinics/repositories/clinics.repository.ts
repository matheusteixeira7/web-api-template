import { Clinic } from '../entities/clinic.entity';

/**
 * Abstract repository for clinic data operations.
 * Implementations handle the actual database interactions.
 */
export abstract class ClinicsRepository {
  /**
   * Finds a clinic by its unique identifier.
   *
   * @param id - The clinic ID
   * @returns The clinic if found, null otherwise
   */
  abstract findById(id: string): Promise<Clinic | null>;

  /**
   * Creates a new clinic in the database.
   *
   * @param data - The clinic entity to create
   * @returns The created clinic
   */
  abstract create(data: Clinic): Promise<Clinic>;

  /**
   * Updates an existing clinic in the database.
   *
   * @param clinic - The clinic entity with updated data
   * @returns The updated clinic
   */
  abstract save(clinic: Clinic): Promise<Clinic>;
}
