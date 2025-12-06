import { PrismaUsersRepository } from '@/modules/users/repositories/prisma-users-repository';
import { CreateUserUseCase } from '@/modules/users/use-cases/create-user.usecase';

export function makeCreateUserUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const useCase = new CreateUserUseCase(usersRepository);

  return useCase;
}
