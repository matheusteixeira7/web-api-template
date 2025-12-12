import {
  UsersApi,
  type CreateUserData,
} from '@/shared/public-api/interface/users-api.interface';
import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { CreateUserUseCase } from '../../use-cases/create-user.usecase';
import { FindUserUseCase } from '../../use-cases/find-user.usecase';
import { UpdatePasswordUseCase } from '../../use-cases/update-password.usecase';
import { VerifyEmailUseCase } from '../../use-cases/verify-email.usecase';

/**
 * UsersFacade - Public API implementation for Users module
 *
 * IMPORTANT: Facade is a DELEGATION layer, not business logic layer.
 * - Delegates to Use Cases (business logic)
 * - Does NOT call repositories directly
 * - Does NOT contain business rules
 * - Acts as public interface for external modules
 *
 * This is the ONLY way external modules interact with Users module.
 */
@Injectable()
export class UsersFacade implements UsersApi {
  constructor(
    private readonly findUserUseCase: FindUserUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly updatePasswordUseCase: UpdatePasswordUseCase,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.findUserUseCase.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findUserUseCase.findByEmail(email);
  }

  async findByIdWithClinic(
    id: string,
  ): Promise<{ user: User; clinic: { isSetupComplete: boolean } } | null> {
    const result = await this.findUserUseCase.findByIdWithClinic(id);

    if (!result) {
      return null;
    }

    const { isClinicSetupComplete, ...user } = result;

    return {
      user: new User(user),
      clinic: {
        isSetupComplete: isClinicSetupComplete,
      },
    };
  }

  async createUser(data: CreateUserData): Promise<User> {
    return this.createUserUseCase.createUser(data);
  }

  async updateUser(user: User): Promise<User> {
    return this.createUserUseCase.updateUser(user);
  }

  async verifyEmailAddress(userId: string): Promise<void> {
    return this.verifyEmailUseCase.execute({ userId });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    return this.updatePasswordUseCase.execute({ userId, hashedPassword });
  }
}
