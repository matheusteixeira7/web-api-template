import { EnvModule } from '@/infra/env/env.module';
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

// Factories
import { makeAuthenticateUserUseCase } from './use-cases/factories/make-authenticate-user-use-case.factory';
import { makeForgotPasswordUseCase } from './use-cases/factories/make-forgot-password-use-case.factory';
import { makeLogoutUseCase } from './use-cases/factories/make-logout-use-case.factory';
import { makeOAuthGoogleUseCase } from './use-cases/factories/make-oauth-google-use-case.factory';
import { makeRefreshTokenUseCase } from './use-cases/factories/make-refresh-token-use-case.factory';
import { makeRegisterUserUseCase } from './use-cases/factories/make-register-user-use-case.factory';
import { makeResetPasswordUseCase } from './use-cases/factories/make-reset-password-use-case.factory';
import { makeSendVerificationEmailUseCase } from './use-cases/factories/make-send-verification-email-use-case.factory';
import { makeVerifyEmailUseCase } from './use-cases/factories/make-verify-email-use-case.factory';

@Module({
  imports: [EnvModule],
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
    {
      provide: RegisterUserUseCase,
      useFactory: makeRegisterUserUseCase,
    },
    {
      provide: AuthenticateUserUseCase,
      useFactory: makeAuthenticateUserUseCase,
    },
    {
      provide: RefreshTokenUseCase,
      useFactory: makeRefreshTokenUseCase,
    },
    {
      provide: LogoutUseCase,
      useFactory: makeLogoutUseCase,
    },
    {
      provide: SendVerificationEmailUseCase,
      useFactory: makeSendVerificationEmailUseCase,
    },
    {
      provide: VerifyEmailUseCase,
      useFactory: makeVerifyEmailUseCase,
    },
    {
      provide: ForgotPasswordUseCase,
      useFactory: makeForgotPasswordUseCase,
    },
    {
      provide: ResetPasswordUseCase,
      useFactory: makeResetPasswordUseCase,
    },
    {
      provide: OAuthGoogleUseCase,
      useFactory: makeOAuthGoogleUseCase,
    },
  ],
})
export class AuthModule {}
