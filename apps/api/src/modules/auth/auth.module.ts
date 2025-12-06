import { Module } from '@nestjs/common';
import { CryptographyModule } from '@/infra/cryptography/cryptography.module';
import { UsersRepository } from '@/modules/users/repositories/users.repository';
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma-users-repository';
import { CreateAccountController } from './controllers/create-account.controller';
import { AuthenticateController } from './controllers/authenticate.controller';
import { RegisterUserUseCase } from './use-cases/register-user.usecase';
import { AuthenticateUserUseCase } from './use-cases/authenticate-user.usecase';

@Module({
  imports: [CryptographyModule],
  controllers: [CreateAccountController, AuthenticateController],
  providers: [
    RegisterUserUseCase,
    AuthenticateUserUseCase,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
  ],
})
export class AuthModule {}
