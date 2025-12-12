import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import { Injectable } from '@nestjs/common';
import type {
  FindUserInputDto,
  FindUserResponseDto,
} from '../dto/find-user.dto';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class FindUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

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

  async executeWithClinic({ userId }: FindUserInputDto) {
    const user = await this.usersRepository.findByIdWithClinic(userId);

    if (!user) {
      throw new ResourceNotFoundError();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
    };
  }

  /**
   * Methods for facade usage
   * These return raw entities (with password) for internal module communication
   */
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findByIdWithClinic(
    id: string,
  ): Promise<{ user: User; clinic: { isSetupComplete: boolean } } | null> {
    const result = await this.usersRepository.findByIdWithClinic(id);

    if (!result) {
      return null;
    }

    const { isClinicSetupComplete, ...userData } = result;

    return {
      user: new User(userData),
      clinic: {
        isSetupComplete: isClinicSetupComplete,
      },
    };
  }
}
