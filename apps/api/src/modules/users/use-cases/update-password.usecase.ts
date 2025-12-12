import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';

/**
 * UpdatePasswordUseCase - Update user's password
 *
 * This use case handles password update logic.
 * Previously this was scattered across auth module use cases,
 * but it's been centralized here because it modifies User entity.
 *
 * Note: This receives an already-hashed password.
 * Password hashing should be done by the calling module (auth).
 */
@Injectable()
export class UpdatePasswordUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

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

export interface UpdatePasswordInput {
  userId: string;
  hashedPassword: string;
}
