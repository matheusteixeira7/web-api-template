import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher';
import { ResetPasswordUseCase } from '../reset-password.usecase';

export function makeResetPasswordUseCase() {
  const hashGenerator = new BcryptHasher();

  return new ResetPasswordUseCase(hashGenerator);
}
