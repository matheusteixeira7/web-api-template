import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import type { UsersRepository } from '../repository/users.repository';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {
    this.usersRepository = usersRepository;
  }

  async execute(createUserDto: CreateUserDto) {
    return this.usersRepository.create(createUserDto);
  }
}
