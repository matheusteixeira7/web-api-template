import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import type {
  FindUserInputDto,
  FindUserResponseDto,
} from '../dto/find-user.dto';
import type { UsersRepository } from '../repositories/users.repository';

export class FindUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {
    this.usersRepository = usersRepository;
  }

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
}
