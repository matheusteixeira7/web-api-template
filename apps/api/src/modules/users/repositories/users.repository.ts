import { User } from '../entities/user.entity';

export abstract class UsersRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract create(data: User): Promise<User>;
  abstract save(user: User): Promise<User>;
}
