import { JwtEncrypter } from '@/infra/cryptography/jwt-encrypter';
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma-users-repository';
import { PrismaRefreshTokensRepository } from '../../repositories/prisma-refresh-tokens.repository';
import { RefreshTokenUseCase } from '../refresh-token.usecase';
import { env } from './config';

export function makeRefreshTokenUseCase() {
  const refreshTokensRepository = new PrismaRefreshTokensRepository();
  const usersRepository = new PrismaUsersRepository();
  const encrypter = new JwtEncrypter({
    privateKey: Buffer.from(env.JWT_PRIVATE_KEY, 'base64'),
    expiresIn: '15m',
  });

  return new RefreshTokenUseCase(
    refreshTokensRepository,
    usersRepository,
    encrypter,
  );
}
