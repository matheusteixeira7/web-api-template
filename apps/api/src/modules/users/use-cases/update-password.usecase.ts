import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';

/**
 * Use case for updating a user's password.
 *
 * @remarks
 * This use case handles password update logic. It receives an already-hashed
 * password - password hashing should be done by the calling module (auth).
 * Centralized here because it modifies the User entity.
 *
 * @throws {Error} If the user is not found
 */
@Injectable()
export class UpdatePasswordUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Updates a user's password.
   *
   * @param input - Contains the userId and the new hashed password
   * @throws {Error} If the user is not found
   */
  async execute(input: UpdatePasswordInput): Promise<void> {
    const user = await this.usersRepository.findById(input.userId);

    if (!user) {
      throw new Error(`User with ID ${input.userId} not found`);
    }

    user.password = input.hashedPassword;
    user.updatedAt = new Date();

    await this.usersRepository.save(user);
  }
}

/** Input for password update */
export interface UpdatePasswordInput {
  /** The user's unique identifier */
  userId: string;
  /** The new password (already hashed) */
  hashedPassword: string;
}
