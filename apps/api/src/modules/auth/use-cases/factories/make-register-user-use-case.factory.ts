import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher';
import { PrismaClinicsRepository } from '@/modules/clinics/repositories/prisma-clinics-repository';
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma-users-repository';
import { RegisterUserUseCase } from '../register-user.usecase';

export function makeRegisterUserUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const clinicsRepository = new PrismaClinicsRepository();
  const hashGenerator = new BcryptHasher();

  return new RegisterUserUseCase(
    usersRepository,
    clinicsRepository,
    hashGenerator,
  );
}
