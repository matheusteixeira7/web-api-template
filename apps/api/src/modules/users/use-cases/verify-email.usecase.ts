import { Injectable } from '@nestjs/common';
import type { VerifyEmailInputDto } from '../dto/verify-email.dto';
import { UsersRepository } from '../repositories/users.repository';

/**
 * Use case for marking a user's email as verified.
 *
 * @remarks
 * This use case handles email verification logic.
 * Previously this was in auth module but moved here because it modifies User entity.
 * Domain logic should live in the module that owns the entity.
 *
 * @throws {Error} If the user is not found
 */
@Injectable()
export class VerifyEmailUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Marks a user's email as verified.
   *
   * @param input - Contains the userId to verify
   * @throws {Error} If the user is not found
   */
  async execute(input: VerifyEmailInputDto): Promise<void> {
    const user = await this.usersRepository.findById(input.userId);

    if (!user) {
      throw new Error(`User with ID ${input.userId} not found`);
    }

    user.emailVerified = true;
    user.updatedAt = new Date();

    await this.usersRepository.save(user);
  }
}
