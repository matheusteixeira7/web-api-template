import { PrismaRefreshTokensRepository } from '../../repositories/prisma-refresh-tokens.repository';
import { LogoutUseCase } from '../logout.usecase';

export function makeLogoutUseCase() {
  const refreshTokensRepository = new PrismaRefreshTokensRepository();

  return new LogoutUseCase(refreshTokensRepository);
}
