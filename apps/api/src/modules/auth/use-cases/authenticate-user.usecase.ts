import { Injectable } from '@nestjs/common';
import { Encrypter } from '@/shared/cryptography/encrypter';
import { HashComparer } from '@/shared/cryptography/hash-comparer';
import { UsersRepository } from '@/modules/users/repositories/users.repository';
import { WrongCredentialsError } from '../errors/wrong-credentials.error';

interface AuthenticateUserRequest {
  email: string;
  password: string;
}

interface AuthenticateUserResponse {
  accessToken: string;
}

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new WrongCredentialsError();
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new WrongCredentialsError();
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id,
      role: user.role,
    });

    return { accessToken };
  }
}
