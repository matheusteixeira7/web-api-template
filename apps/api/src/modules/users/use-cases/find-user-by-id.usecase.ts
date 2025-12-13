import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class FindUserByIdUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }
}
