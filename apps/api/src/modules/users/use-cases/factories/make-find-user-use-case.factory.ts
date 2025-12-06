import { PrismaUsersRepository } from '@/modules/users/repositories/prisma-users-repository';
import { FindUserUseCase } from '@/modules/users/use-cases/find-user.usecase';

export function makeFindUserUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const useCase = new FindUserUseCase(usersRepository);

  return useCase;
}
