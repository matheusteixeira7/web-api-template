import {
  prisma,
  Clinic as PrismaClinic,
  User as PrismaUser,
  Prisma,
} from '@workspace/database';
import type { BusinessHours } from '@/shared/types/business-hours.type';
import { User } from '@/modules/users/entities/user.entity';
import { Clinic } from '../entities/clinic.entity';
import { ClinicsRepository } from './clinics.repository';

export class PrismaClinicsRepository extends ClinicsRepository {
  async findById(id: string): Promise<Clinic | null> {
    const clinic = await prisma.clinic.findUnique({
      where: {
        id,
      },
    });

    if (!clinic) {
      return null;
    }

    return this.mapToEntity(clinic);
  }

  async create(data: Clinic): Promise<Clinic> {
    const createdClinic = await prisma.clinic.create({
      data: {
        id: data.id,
        name: data.name,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        businessHours: data.businessHours
          ? (data.businessHours as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        timezone: data.timezone,
        averageAppointmentValue: data.averageAppointmentValue,
        subscriptionId: data.subscriptionId,
        isSetupComplete: data.isSetupComplete,
      },
    });

    return this.mapToEntity(createdClinic);
  }

  async save(clinic: Clinic): Promise<Clinic> {
    const updatedClinic = await prisma.clinic.update({
      where: {
        id: clinic.id,
      },
      data: {
        name: clinic.name,
        contactEmail: clinic.contactEmail,
        contactPhone: clinic.contactPhone,
        businessHours: clinic.businessHours
          ? (clinic.businessHours as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        timezone: clinic.timezone,
        averageAppointmentValue: clinic.averageAppointmentValue,
        subscriptionId: clinic.subscriptionId,
        isSetupComplete: clinic.isSetupComplete,
      },
    });

    return this.mapToEntity(updatedClinic);
  }

  async createWithFirstUser(
    clinicData: { name: string },
    userData: {
      name: string;
      email: string;
      password: string | null;
      emailVerified: boolean;
    },
  ): Promise<User> {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create placeholder clinic
      const clinic = await tx.clinic.create({
        data: {
          name: clinicData.name,
          isSetupComplete: false,
        },
      });

      // 2. Create user linked to clinic as ADMIN (first user)
      const user = await tx.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          clinicId: clinic.id,
          role: 'ADMIN',
          emailVerified: userData.emailVerified,
        },
      });

      return user;
    });

    return this.mapUserToEntity(result);
  }

  mapToEntity(clinic: PrismaClinic): Clinic {
    return new Clinic({
      id: clinic.id,
      name: clinic.name,
      contactEmail: clinic.contactEmail,
      contactPhone: clinic.contactPhone,
      businessHours: clinic.businessHours
        ? (clinic.businessHours as unknown as BusinessHours)
        : null,
      timezone: clinic.timezone,
      averageAppointmentValue:
        clinic.averageAppointmentValue?.toNumber() ?? null,
      subscriptionId: clinic.subscriptionId,
      isSetupComplete: clinic.isSetupComplete,
      createdAt: clinic.createdAt,
      updatedAt: clinic.updatedAt,
      deletedAt: clinic.deletedAt,
    });
  }

  private mapUserToEntity(user: PrismaUser): User {
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
