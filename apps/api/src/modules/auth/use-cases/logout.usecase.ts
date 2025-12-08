import type { RefreshTokensRepository } from '../repositories/refresh-tokens.repository';

interface LogoutRequest {
  refreshToken: string | undefined;
}

export class LogoutUseCase {
  constructor(
    private readonly refreshTokensRepository: RefreshTokensRepository,
  ) {}

  async execute({ refreshToken }: LogoutRequest): Promise<void> {
    if (refreshToken) {
      try {
        await this.refreshTokensRepository.deleteByToken(refreshToken);
      } catch {
        // Ignore errors when deleting token
      }
    }
  }
}
