import { Inject, Injectable } from '@nestjs/common'
import { User } from '@/modules/users/entities/user.entity'
import { UsersApi } from '@/shared/public-api/interface/users-api.interface'
import { HashGenerator } from '@/shared/cryptography/hash-generator'
import { CLINIC_DEFAULTS } from '@/shared/constants/clinic.constants'
import { RegisterUserApplicationService } from '@/application/services/register-user-application.service'
import { UserAlreadyExistsError } from './errors/user-already-exists.error'

interface RegisterUserRequest {
  name: string
  email: string
  password: string
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(UsersApi) private readonly usersApi: UsersApi, // ✨ Facade via Symbol token
    private readonly registerUserAppService: RegisterUserApplicationService,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute({ name, email, password }: RegisterUserRequest): Promise<User> {
    // 1. Check if user exists (via facade)
    const existingUser = await this.usersApi.findByEmail(email)

    if (existingUser) {
      throw new UserAlreadyExistsError(email)
    }

    // 2. Hash password
    const hashedPassword = await this.hashGenerator.hash(password)

    // 3. Delegate atomic operation to Application Service
    return await this.registerUserAppService.execute({
      name,
      email,
      hashedPassword,
      emailVerified: false,
      clinicName: CLINIC_DEFAULTS.NAME,
    })
  }
}
