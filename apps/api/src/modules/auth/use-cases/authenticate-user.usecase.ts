import { Encrypter } from '@/shared/cryptography/encrypter';
import { HashComparer } from '@/shared/cryptography/hash-comparer';
import { UsersApi } from '@/shared/public-api/interface/users-api.interface';
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RefreshTokensRepository } from '../repositories/refresh-tokens.repository';
import { WrongCredentialsError } from './errors/wrong-credentials.error';

interface AuthenticateUserRequest {
  email: string;
  password: string;
}

interface AuthenticateUserResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    @Inject(UsersApi) private readonly usersApi: UsersApi, // ✨ Facade via Symbol token
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly refreshTokensRepository: RefreshTokensRepository,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    const user = await this.usersApi.findByEmail(email);

    if (!user) {
      throw new WrongCredentialsError();
    }

    // OAuth users have no password - they cannot authenticate via password
    if (!user.password) {
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

    // Generate refresh token
    const refreshToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokensRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    return { accessToken, refreshToken, userId: user.id };
  }
}
