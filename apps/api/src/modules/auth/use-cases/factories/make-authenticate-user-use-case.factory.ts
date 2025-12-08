import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encrypter';
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma-users-repository';
import { PrismaRefreshTokensRepository } from '../../repositories/prisma-refresh-tokens.repository';
import { AuthenticateUserUseCase } from '../authenticate-user.usecase';
import { env } from './config';

export function makeAuthenticateUserUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const hashComparer = new BcryptHasher();
  const encrypter = new JwtEncrypter({
    privateKey: Buffer.from(env.JWT_PRIVATE_KEY, 'base64'),
    expiresIn: '15m',
  });
  const refreshTokensRepository = new PrismaRefreshTokensRepository();

  return new AuthenticateUserUseCase(
    usersRepository,
    hashComparer,
    encrypter,
    refreshTokensRepository,
  );
}
