import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import { Injectable } from '@nestjs/common';
import type {
  FindUserInputDto,
  FindUserResponseDto,
} from '../dto/find-user.dto';
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
}
