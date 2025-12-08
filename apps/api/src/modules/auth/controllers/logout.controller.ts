import { Controller, Delete, Req, Res } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Public } from '@/infra/auth/public';
import { LogoutUseCase } from '../use-cases/logout.usecase';

@Controller('/sessions')
@Public()
export class LogoutController {
  constructor(private logoutUseCase: LogoutUseCase) {}

  @Delete()
  async handle(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const refreshToken = request.cookies['refresh_token'];

    await this.logoutUseCase.execute({ refreshToken });

    // Clear cookies
    response.clearCookie('access_token', { path: '/' });
    response.clearCookie('refresh_token', { path: '/' });
    response.clearCookie('csrf_token', { path: '/' });

    return { success: true };
  }
}
