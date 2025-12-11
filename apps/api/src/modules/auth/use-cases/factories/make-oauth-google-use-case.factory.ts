import { JwtEncrypter } from '@/infra/cryptography/jwt-encrypter';
import { PrismaClinicsRepository } from '@/modules/clinics/repositories/prisma-clinics-repository';
import { OAuthGoogleUseCase } from '../oauth-google.usecase';
import { env } from './config';

export function makeOAuthGoogleUseCase() {
  const encrypter = new JwtEncrypter({
    privateKey: Buffer.from(env.JWT_PRIVATE_KEY, 'base64'),
    expiresIn: '15m',
  });

  const clinicsRepository = new PrismaClinicsRepository();

  return new OAuthGoogleUseCase(encrypter, clinicsRepository, {
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${env.FRONTEND_URL}/auth/callback/google`,
  });
}
