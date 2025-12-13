import { User as PrismaUser } from '@workspace/database';
import type { UserWithClinicStatus } from '../dto/user-with-clinic-status.dto';
import { User } from '../entities/user.entity';

/**
 * Abstract repository interface for user data access.
 *
 * @remarks
 * This defines the contract for user persistence operations.
 * Implementations handle the actual database interactions.
 * Following the Repository Pattern for data access abstraction.
 */
export abstract class UsersRepository {
  /**
   * Finds a user by their unique identifier.
   * @param id - The user's UUID
   * @returns The user entity if found, null otherwise
   */
  abstract findById(id: string): Promise<User | null>;

  /**
   * Finds a user by their email address.
   * @param email - The user's email address
   * @returns The user entity if found, null otherwise
   */
  abstract findByEmail(email: string): Promise<User | null>;

  /**
   * Finds a user by ID including their clinic's setup status.
   * @param id - The user's UUID
   * @returns The user with clinic status if found, null otherwise
   */
  abstract findByIdWithClinic(id: string): Promise<UserWithClinicStatus | null>;

  /**
   * Creates a new user in the database.
   * @param data - The user entity to persist
   * @returns The created user entity
   */
  abstract create(data: User): Promise<User>;

  /**
   * Updates an existing user in the database.
   * @param user - The user entity with updated data
   * @returns The updated user entity
   */
  abstract save(user: User): Promise<User>;

  /**
   * Maps a Prisma user record to a User domain entity.
   * @param user - The Prisma user record
   * @returns The mapped User entity
   */
  abstract mapToEntity(user: PrismaUser): User;
}
