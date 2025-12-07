import { Module } from '@nestjs/common';
import { CryptographyModule } from '@/infra/cryptography/cryptography.module';
import { UsersRepository } from '@/modules/users/repositories/users.repository';
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma-users-repository';
import { CreateAccountController } from './controllers/create-account.controller';
import { AuthenticateController } from './controllers/authenticate.controller';
import { RefreshTokenController } from './controllers/refresh-token.controller';
import { LogoutController } from './controllers/logout.controller';
import { RegisterUserUseCase } from './use-cases/register-user.usecase';
import { AuthenticateUserUseCase } from './use-cases/authenticate-user.usecase';
import { RefreshTokenUseCase } from './use-cases/refresh-token.usecase';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { PrismaRefreshTokensRepository } from './repositories/prisma-refresh-tokens.repository';

@Module({
  imports: [CryptographyModule],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    RefreshTokenController,
    LogoutController,
  ],
  providers: [
    RegisterUserUseCase,
    AuthenticateUserUseCase,
    RefreshTokenUseCase,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    {
      provide: RefreshTokensRepository,
      useClass: PrismaRefreshTokensRepository,
    },
  ],
})
export class AuthModule {}
