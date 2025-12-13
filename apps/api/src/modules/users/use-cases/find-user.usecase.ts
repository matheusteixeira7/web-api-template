import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import { Injectable } from '@nestjs/common';
import type {
  FindUserInputDto,
  FindUserResponseDto,
} from '../dto/find-user.dto';
import { UsersRepository } from '../repositories/users.repository';

/**
 * Use case for finding a user by ID.
 *
 * @remarks
 * Retrieves a user by their unique identifier.
 * Returns the user without the password field for security.
 *
 * @throws {ResourceNotFoundError} If the user is not found
 */
@Injectable()
export class FindUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Executes the find user operation.
   *
   * @param input - Contains the userId to search for
   * @returns The found user without password
   * @throws {ResourceNotFoundError} If the user is not found
   */
  async execute({ userId }: FindUserInputDto): Promise<FindUserResponseDto> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new ResourceNotFoundError();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
    };
  }
}
