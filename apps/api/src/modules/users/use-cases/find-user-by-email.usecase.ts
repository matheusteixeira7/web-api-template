import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';

/**
 * Use case for finding a user by their email address.
 *
 * @remarks
 * Used primarily by the authentication module to verify credentials.
 * Returns the full user entity (including password) for auth verification.
 */
@Injectable()
export class FindUserByEmailUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Finds a user by their email address.
   *
   * @param email - The user's email address
   * @returns The user entity if found, null otherwise
   */
  async execute(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }
}
