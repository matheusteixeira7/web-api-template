import { PrismaService } from '@/infra/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Provider as PrismaProvider } from '@workspace/database';
import { Provider } from '../entities/provider.entity';
import type { FindProvidersFilters } from '../types/provider-filters.types';
import { ProvidersRepository } from './providers.repository';

/**
 * Prisma implementation of the ProvidersRepository.
 * Handles all provider database operations using Prisma ORM.
 */
@Injectable()
export class PrismaProvidersRepository extends ProvidersRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /** @inheritdoc */
  async findById(id: string): Promise<Provider | null> {
    const provider = await this.prisma.client.provider.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!provider) {
      return null;
    }

    return this.mapToEntity(provider);
  }

  /** @inheritdoc */
  async findByClinicId(
    clinicId: string,
    filters: FindProvidersFilters,
  ): Promise<{ providers: Provider[]; total: number }> {
    const { search, status, specialty, sortBy, sortDir, page, perPage } =
      filters;

    // Build where clause
    const where: Prisma.ProviderWhereInput = {
      clinicId,
    };

    // Status filter
    if (status === 'active') {
      where.deletedAt = null;
    } else if (status === 'inactive') {
      where.deletedAt = { not: null };
    }
    // 'all' includes both active and inactive

    // Search filter (case-insensitive name search)
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Specialty filter
    if (specialty) {
      where.specialty = specialty;
    }

    // Build orderBy clause
    const orderBy: Prisma.ProviderOrderByWithRelationInput = {
      [sortBy]: sortDir,
    };

    // Execute query with pagination
    const [providers, total] = await Promise.all([
      this.prisma.client.provider.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.client.provider.count({ where }),
    ]);

    return {
      providers: providers.map((provider) => this.mapToEntity(provider)),
      total,
    };
  }

  /** @inheritdoc */
  async findByUserId(userId: string): Promise<Provider | null> {
    const provider = await this.prisma.client.provider.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
    });

    if (!provider) {
      return null;
    }

    return this.mapToEntity(provider);
  }

  /** @inheritdoc */
  async create(data: Provider): Promise<Provider> {
    const createdProvider = await this.prisma.client.provider.create({
      data: {
        id: data.id,
        clinicId: data.clinicId,
        userId: data.userId,
        name: data.name,
        specialty: data.specialty,
        defaultAppointmentDuration: data.defaultAppointmentDuration,
        workingHours: data.workingHours
          ? (data.workingHours as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });

    return this.mapToEntity(createdProvider);
  }

  /** @inheritdoc */
  async save(provider: Provider): Promise<Provider> {
    const updatedProvider = await this.prisma.client.provider.update({
      where: {
        id: provider.id,
      },
      data: {
        clinicId: provider.clinicId,
        userId: provider.userId,
        name: provider.name,
        specialty: provider.specialty,
        defaultAppointmentDuration: provider.defaultAppointmentDuration,
        workingHours: provider.workingHours
          ? (provider.workingHours as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });

    return this.mapToEntity(updatedProvider);
  }

  /** @inheritdoc */
  async softDelete(id: string): Promise<void> {
    await this.prisma.client.provider.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /** @inheritdoc */
  mapToEntity(provider: PrismaProvider): Provider {
    return new Provider({
      id: provider.id,
      clinicId: provider.clinicId,
      userId: provider.userId,
      name: provider.name,
      specialty: provider.specialty,
      defaultAppointmentDuration: provider.defaultAppointmentDuration,
      workingHours: provider.workingHours
        ? (provider.workingHours as Record<string, unknown>)
        : null,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
      deletedAt: provider.deletedAt,
    });
  }
}
