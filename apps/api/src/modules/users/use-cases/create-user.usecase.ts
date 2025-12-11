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
