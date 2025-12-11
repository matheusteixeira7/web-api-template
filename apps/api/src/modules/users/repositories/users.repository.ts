import { User as PrismaUser } from '@workspace/database';
import { User } from '../entities/user.entity';

export interface UserWithClinicStatus extends User {
  isClinicSetupComplete: boolean;
}

export abstract class UsersRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByIdWithClinic(id: string): Promise<UserWithClinicStatus | null>;
  abstract create(data: User): Promise<User>;
  abstract save(user: User): Promise<User>;
  abstract mapToEntity(user: PrismaUser): User;
}
