import { UsersApi } from '@/shared/public-api/interface/users-api.interface';
import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { FindUserByEmailUseCase } from '../../use-cases/find-user-by-email.usecase';
import { FindUserByIdUseCase } from '../../use-cases/find-user-by-id.usecase';
import { UpdatePasswordUseCase } from '../../use-cases/update-password.usecase';
import { VerifyEmailUseCase } from '../../use-cases/verify-email.usecase';

/**
 * UsersFacade - Public API implementation for Users module.
 *
 * @remarks
 * This facade is a pure DELEGATION layer, not a business logic layer.
 * - Delegates to Use Cases (business logic)
 * - Does NOT call repositories directly
 * - Does NOT contain business rules
 * - Acts as public interface for external modules
 *
 * This is the ONLY way external modules should interact with the Users module.
 *
 * @example
 * ```typescript
 * const user = await usersFacade.findById('user-uuid');
 * ```
 */
@Injectable()
export class UsersFacade implements UsersApi {
  constructor(
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly findUserByEmailUseCase: FindUserByEmailUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly updatePasswordUseCase: UpdatePasswordUseCase,
  ) {}

  /**
   * Finds a user by their unique identifier.
   *
   * @param id - The user's UUID
   * @returns The user entity if found, null otherwise
   */
  async findById(id: string): Promise<User | null> {
    return this.findUserByIdUseCase.execute(id);
  }

  /**
   * Finds a user by their email address.
   *
   * @param email - The user's email address
   * @returns The user entity if found, null otherwise
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findUserByEmailUseCase.execute(email);
  }

  /**
   * Marks a user's email address as verified.
   *
   * @param userId - The user's unique identifier
   */
  async verifyEmailAddress(userId: string): Promise<void> {
    return this.verifyEmailUseCase.execute({ userId });
  }

  /**
   * Updates a user's password.
   *
   * @param userId - The user's unique identifier
   * @param hashedPassword - The new password (already hashed)
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    return this.updatePasswordUseCase.execute({ userId, hashedPassword });
  }
}
