import { Injectable } from '@nestjs/common';
import { HashGenerator } from '@/shared/cryptography/hash-generator';
import { User } from '@/modules/users/entities/user.entity';
import { UsersRepository } from '@/modules/users/repositories/users.repository';
import { UserAlreadyExistsError } from '../errors/user-already-exists.error';

interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({ name, email, password }: RegisterUserRequest): Promise<User> {
    const existingUser = await this.usersRepository.findByEmail(email);

    if (existingUser) {
      throw new UserAlreadyExistsError(email);
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'USER',
    });

    return this.usersRepository.create(user);
  }
}
