import type {
  CreateUserInputDto,
  CreateUserResponseDto,
} from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import type { UsersRepository } from '../repositories/users.repository';

export class CreateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {
    this.usersRepository = usersRepository;
  }

  async execute({
    email,
    name,
  }: CreateUserInputDto): Promise<CreateUserResponseDto> {
    const userEntity = new User({
      email,
      name,
    });

    const user = await this.usersRepository.create(userEntity);

    return {
      user,
    };
  }
}
