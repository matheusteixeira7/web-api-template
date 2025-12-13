import { PrismaService } from '@/infra/database/prisma.service';
import type { BusinessHours } from '@/shared/types/business-hours.type';
import { Injectable } from '@nestjs/common';
import { Prisma, Clinic as PrismaClinic } from '@workspace/database';
import { Clinic } from '../entities/clinic.entity';
import { ClinicsRepository } from './clinics.repository';

/**
 * Prisma implementation of the ClinicsRepository.
 * Handles all clinic database operations using Prisma ORM.
 */
@Injectable()
export class PrismaClinicsRepository extends ClinicsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /** @inheritdoc */
  async findById(id: string): Promise<Clinic | null> {
    const clinic = await this.prisma.client.clinic.findUnique({
      where: {
        id,
      },
    });

    if (!clinic) {
      return null;
    }

    return this.mapToEntity(clinic);
  }

  /** @inheritdoc */
  async create(data: Clinic): Promise<Clinic> {
    const createdClinic = await this.prisma.client.clinic.create({
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

  /** @inheritdoc */
  async save(clinic: Clinic): Promise<Clinic> {
    const updatedClinic = await this.prisma.client.clinic.update({
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

  /**
   * Maps a Prisma clinic record to a domain entity.
   *
   * @param clinic - The Prisma clinic record
   * @returns The clinic domain entity
   */
  private mapToEntity(clinic: PrismaClinic): Clinic {
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
}
