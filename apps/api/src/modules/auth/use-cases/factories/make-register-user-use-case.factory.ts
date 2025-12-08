import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher';
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma-users-repository';
import { RegisterUserUseCase } from '../register-user.usecase';

export function makeRegisterUserUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const hashGenerator = new BcryptHasher();

  return new RegisterUserUseCase(usersRepository, hashGenerator);
}
