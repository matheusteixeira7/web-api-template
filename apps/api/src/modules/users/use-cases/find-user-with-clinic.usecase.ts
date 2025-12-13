import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';

export interface FindUserWithClinicResponse {
  user: User;
  clinic: {
    isSetupComplete: boolean;
  };
}

@Injectable()
export class FindUserWithClinicUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string): Promise<FindUserWithClinicResponse | null> {
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
