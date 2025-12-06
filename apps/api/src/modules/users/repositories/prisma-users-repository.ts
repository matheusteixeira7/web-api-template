import { prisma, User as PrismaUser } from '@workspace/database';
import { User } from '../entities/user.entity';
import type { UsersRepository } from './users.repository';

export class PrismaUsersRepository implements UsersRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return null;
    }

    return this.mapToEntity(user);
  }

  async create(data: User): Promise<User> {
    const createdUser = await prisma.user.create({
      data,
    });

    return this.mapToEntity(createdUser);
  }

  async save(user: User): Promise<User> {
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: user,
    });

    return this.mapToEntity(updatedUser);
  }

  mapToEntity(user: PrismaUser): User {
    return new User({
      id: user.id,
      email: user.email,
      name: user.name || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    });
  }
}
