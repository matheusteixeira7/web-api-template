import { User } from '@/modules/users/entities/user.entity';

/**
 * Public API contract for Users module
 *
 * This interface defines all operations that external modules can perform
 * on the Users module. It serves as the explicit communication contract
 * following the Facade Pattern.
 *
 * Usage:
 * - External modules inject via Symbol token: @Inject(UsersApi)
 * - Never import concrete implementations (UsersFacade, repositories)
 * - This enables polymorphism: swap UsersFacade ↔ UsersHttpClient
 */
export interface UsersApi {
  /**
   * Find user by ID
   * @param id User unique identifier
   * @returns User entity or null if not found
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email address
   * @param email User email
   * @returns User entity or null if not found
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Mark user's email as verified
   * @param userId User unique identifier
   */
  verifyEmailAddress(userId: string): Promise<void>;

  /**
   * Update user's password
   * @param userId User unique identifier
   * @param hashedPassword New hashed password
   */
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
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
 *   constructor(@Inject(UsersApi) private usersApi: UsersApi) {}
 * }
 */
export const UsersApi = Symbol('UsersApi');
