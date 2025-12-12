import { ApplicationModule } from '@/application/application.module';
import { CryptographyModule } from '@/infra/cryptography/cryptography.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { EnvModule } from '@/infra/env/env.module';
import { MailModule } from '@/infra/mail/mail.module';
import { UsersModule } from '@/modules/users/users.module';
import { Module } from '@nestjs/common';

// Controllers
import { AuthenticateController } from './controllers/authenticate.controller';
import { CreateAccountController } from './controllers/create-account.controller';
import { ForgotPasswordController } from './controllers/forgot-password.controller';
import { LogoutController } from './controllers/logout.controller';
import { OAuthGoogleController } from './controllers/oauth-google.controller';
import { RefreshTokenController } from './controllers/refresh-token.controller';
import { ResendVerificationController } from './controllers/resend-verification.controller';
import { ResetPasswordController } from './controllers/reset-password.controller';
import { VerifyEmailController } from './controllers/verify-email.controller';

// Use Cases
import { AuthenticateUserUseCase } from './use-cases/authenticate-user.usecase';
import { ForgotPasswordUseCase } from './use-cases/forgot-password.usecase';
import { LogoutUseCase } from './use-cases/logout.usecase';
import { OAuthGoogleUseCase } from './use-cases/oauth-google.usecase';
import { RefreshTokenUseCase } from './use-cases/refresh-token.usecase';
import { RegisterUserUseCase } from './use-cases/register-user.usecase';
import { ResetPasswordUseCase } from './use-cases/reset-password.usecase';
import { SendVerificationEmailUseCase } from './use-cases/send-verification-email.usecase';
import { VerifyEmailUseCase } from './use-cases/verify-email.usecase';

// Repositories
import { PrismaRefreshTokensRepository } from './repositories/prisma-refresh-tokens.repository';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';

/**
 * AuthModule - Authentication domain module
 *
 * This module follows Clean Architecture with Facade Pattern:
 * - Uses NestJS DI (no manual factories)
 * - Imports UsersModule to get UsersApi facade
 * - Imports ApplicationModule for RegisterUserApplicationService
 * - Imports CryptographyModule for HashGenerator and Encrypter
 * - Imports MailModule for MailService
 * - Manages its own RefreshTokens repository (internal to auth)
 */
@Module({
  imports: [
    EnvModule,
    DatabaseModule,
    CryptographyModule, // ✅ Infra providers (HashGenerator, Encrypter)
    MailModule, // ✅ Infra provider (MailService)
    ApplicationModule, // ✅ Application services (RegisterUserApplicationService)
    UsersModule, // ✅ UsersApi facade
  ],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    RefreshTokenController,
    LogoutController,
    VerifyEmailController,
    ResendVerificationController,
    ForgotPasswordController,
    ResetPasswordController,
    OAuthGoogleController,
  ],
  providers: [
    // Repository binding (internal to auth module)
    {
      provide: RefreshTokensRepository,
      useClass: PrismaRefreshTokensRepository,
    },

    // Use cases - all @Injectable, injected by NestJS
    RegisterUserUseCase,
    AuthenticateUserUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    SendVerificationEmailUseCase,
    VerifyEmailUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    OAuthGoogleUseCase,
  ],
})
export class AuthModule {}
