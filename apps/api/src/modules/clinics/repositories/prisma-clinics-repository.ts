import { prisma, Clinic as PrismaClinic } from '@workspace/database';
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
        businessHours: data.businessHours,
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
        businessHours: clinic.businessHours,
        timezone: clinic.timezone,
        averageAppointmentValue: clinic.averageAppointmentValue,
        subscriptionId: clinic.subscriptionId,
        isSetupComplete: clinic.isSetupComplete,
      },
    });

    return this.mapToEntity(updatedClinic);
  }

  mapToEntity(clinic: PrismaClinic): Clinic {
    return new Clinic({
      id: clinic.id,
      name: clinic.name,
      contactEmail: clinic.contactEmail,
      contactPhone: clinic.contactPhone,
      businessHours: clinic.businessHours as object | null,
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
