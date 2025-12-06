import { User } from '../entities/user.entity';

export interface UsersRepository {
  findById(id: string): Promise<User | null>;
  create(data: User): Promise<User>;
  save(user: User): Promise<User>;
}
