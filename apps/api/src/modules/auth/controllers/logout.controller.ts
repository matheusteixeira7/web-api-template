import { Controller, Delete, Req, Res } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Public } from '@/infra/auth/public';
import { RefreshTokensRepository } from '../repositories/refresh-tokens.repository';

@Controller('/sessions')
@Public()
export class LogoutController {
  constructor(private refreshTokensRepository: RefreshTokensRepository) {}

  @Delete()
  async handle(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const refreshToken = request.cookies['refresh_token'];

    if (refreshToken) {
      try {
        await this.refreshTokensRepository.deleteByToken(refreshToken);
      } catch {
        // Ignore errors when deleting token
      }
    }

    // Clear cookies
    response.clearCookie('access_token', { path: '/' });
    response.clearCookie('refresh_token', { path: '/' });
    response.clearCookie('csrf_token', { path: '/' });

    return { success: true };
  }
}
