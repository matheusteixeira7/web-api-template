import { prisma } from '@workspace/database';
import { User } from '@/modules/users/entities/user.entity';
import type { UsersRepository } from '@/modules/users/repositories/users.repository';
import type { HashGenerator } from '@/shared/cryptography/hash-generator';
import { UserAlreadyExistsError } from './errors/user-already-exists.error';

interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute({ name, email, password }: RegisterUserRequest): Promise<User> {
    const existingUser = await this.usersRepository.findByEmail(email);

    if (existingUser) {
      throw new UserAlreadyExistsError(email);
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    // Create clinic and user atomically in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create placeholder clinic
      const clinic = await tx.clinic.create({
        data: {
          name: 'Nova Clínica',
          isSetupComplete: false,
        },
      });

      // 2. Create user linked to clinic as ADMIN (first user)
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          clinicId: clinic.id,
          role: 'ADMIN',
          emailVerified: false,
        },
      });

      return user;
    });

    return this.usersRepository.mapToEntity(result);
  }
}
