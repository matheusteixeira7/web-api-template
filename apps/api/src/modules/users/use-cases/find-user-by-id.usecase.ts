import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';

/**
 * Use case for finding a user by their unique identifier.
 *
 * @remarks
 * This is a simple lookup use case used by the facade.
 * Returns the full user entity (including password) for internal use.
 */
@Injectable()
export class FindUserByIdUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Finds a user by their ID.
   *
   * @param id - The user's unique identifier
   * @returns The user entity if found, null otherwise
   */
  async execute(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }
}
