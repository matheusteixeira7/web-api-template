import type { CreateUserData } from '@/shared/public-api/interface/users-api.interface';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type {
  CreateUserInputDto,
  CreateUserResponseDto,
} from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

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

  /**
   * Methods for facade usage
   */
  async createUser(data: CreateUserData): Promise<User> {
    const user = new User({
      id: randomUUID(),
      email: data.email,
      name: data.name,
      password: data.password,
      clinicId: data.clinicId,
      role: data.role,
      emailVerified: data.emailVerified,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    return this.usersRepository.create(user);
  }

  async updateUser(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
}
