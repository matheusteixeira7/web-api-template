import { Injectable } from '@nestjs/common';
import type {
  CreateUserInputDto,
  CreateUserResponseDto,
} from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';

/**
 * Use case for creating a new user.
 *
 * @remarks
 * Creates a new user entity and persists it to the database.
 * Returns the user without the password field for security.
 */
@Injectable()
export class CreateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Executes the user creation operation.
   *
   * @param input - The user creation data
   * @returns The created user without password
   */
  async execute({
    email,
    name,
    password,
    clinicId,
  }: CreateUserInputDto): Promise<CreateUserResponseDto> {
    const userEntity = new User({
      email,
      name,
      password,
      clinicId,
    });

    const createdUser = await this.usersRepository.create(userEntity);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = createdUser;

    return {
      user: userWithoutPassword,
    };
  }
}
