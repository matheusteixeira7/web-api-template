import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';

/**
 * VerifyEmailUseCase - Mark user's email as verified
 *
 * This use case handles email verification logic.
 * Previously this was in auth module (verify-email.usecase.ts),
 * but it's been moved here because it modifies User entity.
 *
 * Principle: Domain logic should live in the module that owns the entity.
 */
@Injectable()
export class VerifyEmailUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(input: VerifyEmailInput): Promise<void> {
    const user = await this.usersRepository.findById(input.userId);

    if (!user) {
      throw new Error(`User with ID ${input.userId} not found`);
    }

    user.emailVerified = true;
    user.updatedAt = new Date();

    await this.usersRepository.save(user);
  }
}

export interface VerifyEmailInput {
  userId: string;
}
