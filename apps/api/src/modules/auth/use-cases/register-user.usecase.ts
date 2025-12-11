import { User } from '@/modules/users/entities/user.entity';
import type { ClinicsRepository } from '@/modules/clinics/repositories/clinics.repository';
import type { UsersRepository } from '@/modules/users/repositories/users.repository';
import type { HashGenerator } from '@/shared/cryptography/hash-generator';
import { CLINIC_DEFAULTS } from '@/shared/constants/clinic.constants';
import { UserAlreadyExistsError } from './errors/user-already-exists.error';

interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly clinicsRepository: ClinicsRepository,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute({ name, email, password }: RegisterUserRequest): Promise<User> {
    const existingUser = await this.usersRepository.findByEmail(email);

    if (existingUser) {
      throw new UserAlreadyExistsError(email);
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    // Create clinic and user atomically via repository
    const user = await this.clinicsRepository.createWithFirstUser(
      { name: CLINIC_DEFAULTS.NAME },
      {
        name,
        email,
        password: hashedPassword,
        emailVerified: false,
      },
    );

    return user;
  }
}
