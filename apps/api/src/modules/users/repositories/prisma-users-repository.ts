import { PrismaService } from '@/infra/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@workspace/database';
import { User } from '../entities/user.entity';
import { UsersRepository, type UserWithClinicStatus } from './users.repository';

@Injectable()
export class PrismaUsersRepository extends UsersRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.client.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return null;
    }

    return this.mapToEntity(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.client.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return null;
    }

    return this.mapToEntity(user);
  }

  async findByIdWithClinic(id: string): Promise<UserWithClinicStatus | null> {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      include: {
        clinic: {
          select: { isSetupComplete: true },
        },
      },
    });

    if (!user) {
      return null;
    }

    const userEntity = this.mapToEntity(user);
    return {
      ...userEntity,
      isClinicSetupComplete: user.clinic.isSetupComplete,
    };
  }

  async create(data: User): Promise<User> {
    const createdUser = await this.prisma.client.user.create({
      data: {
        id: data.id,
        email: data.email,
        clinicId: data.clinicId,
        name: data.name,
        password: data.password,
        role: data.role,
        emailVerified: data.emailVerified,
      },
    });

    return this.mapToEntity(createdUser);
  }

  async save(user: User): Promise<User> {
    const updatedUser = await this.prisma.client.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: user.email,
        clinicId: user.clinicId,
        name: user.name,
        password: user.password,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });

    return this.mapToEntity(updatedUser);
  }

  mapToEntity(user: PrismaUser): User {
    return new User({
      id: user.id,
      email: user.email,
      clinicId: user.clinicId,
      name: user.name || '',
      password: user.password,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    });
  }
}
