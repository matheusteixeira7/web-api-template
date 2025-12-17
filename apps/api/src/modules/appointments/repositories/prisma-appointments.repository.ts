import { PrismaService } from '@/infra/database/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  Appointment as PrismaAppointment,
  AppointmentStatusEvent as PrismaStatusEvent,
} from '@workspace/database';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentStatusEvent } from '../entities/appointment-status-event.entity';
import type { FindAppointmentsFilters } from '../types/appointment-filters.types';
import { AppointmentsRepository } from './appointments.repository';

/**
 * Prisma implementation of the AppointmentsRepository.
 * Handles all appointment database operations using Prisma ORM.
 */
@Injectable()
export class PrismaAppointmentsRepository extends AppointmentsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /** @inheritdoc */
  async findById(id: string, clinicId: string): Promise<Appointment | null> {
    const appointment = await this.prisma.client.appointment.findFirst({
      where: {
        id,
        clinicId,
        deletedAt: null,
      },
    });

    if (!appointment) {
      return null;
    }

    return this.mapToEntity(appointment);
  }

  /** @inheritdoc */
  async findByClinicId(
    clinicId: string,
    filters: FindAppointmentsFilters,
  ): Promise<{ appointments: Appointment[]; total: number }> {
    return this.findWithFilters({ clinicId }, filters);
  }

  /** @inheritdoc */
  async findByProviderId(
    providerId: string,
    clinicId: string,
    filters: FindAppointmentsFilters,
  ): Promise<{ appointments: Appointment[]; total: number }> {
    return this.findWithFilters({ providerId, clinicId }, filters);
  }

  /** @inheritdoc */
  async findByPatientId(
    patientId: string,
    clinicId: string,
    filters: FindAppointmentsFilters,
  ): Promise<{ appointments: Appointment[]; total: number }> {
    return this.findWithFilters({ patientId, clinicId }, filters);
  }

  /**
   * Private helper method to find appointments with common filtering logic.
   * @param baseWhere - Base where clause with entity-specific conditions
   * @param filters - Filter, sort, and pagination options
   * @returns Object containing appointment entities and total count
   */
  private async findWithFilters(
    baseWhere: Prisma.AppointmentWhereInput,
    filters: FindAppointmentsFilters,
  ): Promise<{ appointments: Appointment[]; total: number }> {
    const {
      startDate,
      endDate,
      status,
      providerId,
      patientId,
      locationId,
      sortBy,
      sortDir,
      page,
      perPage,
    } = filters;

    const where: Prisma.AppointmentWhereInput = {
      ...baseWhere,
      deletedAt: null,
    };

    // Status filter
    if (status && status !== 'all') {
      where.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      where.appointmentStart = {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      };
    }

    // Optional filters (used by findByClinicId)
    if (providerId) {
      where.providerId = providerId;
    }
    if (patientId) {
      where.patientId = patientId;
    }
    if (locationId) {
      where.locationId = locationId;
    }

    const orderBy: Prisma.AppointmentOrderByWithRelationInput = {
      [sortBy]: sortDir,
    };

    const [appointments, total] = await Promise.all([
      this.prisma.client.appointment.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.client.appointment.count({ where }),
    ]);

    return {
      appointments: appointments.map((appointment) =>
        this.mapToEntity(appointment),
      ),
      total,
    };
  }

  /** @inheritdoc */
  async create(data: Appointment): Promise<Appointment> {
    const createdAppointment = await this.prisma.client.appointment.create({
      data: {
        id: data.id,
        clinicId: data.clinicId,
        patientId: data.patientId,
        providerId: data.providerId,
        locationId: data.locationId,
        appointmentStart: data.appointmentStart,
        appointmentEnd: data.appointmentEnd,
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        providerName: data.providerName,
        status: data.status,
        notes: data.notes,
        bookingSource: data.bookingSource,
        confirmedAt: data.confirmedAt,
        checkedInAt: data.checkedInAt,
        createdById: data.createdById,
      },
    });

    return this.mapToEntity(createdAppointment);
  }

  /** @inheritdoc */
  async createWithStatusEvent(
    appointment: Appointment,
    statusEvent: AppointmentStatusEvent,
  ): Promise<Appointment> {
    const [createdAppointment] = await this.prisma.client.$transaction([
      this.prisma.client.appointment.create({
        data: {
          id: appointment.id,
          clinicId: appointment.clinicId,
          patientId: appointment.patientId,
          providerId: appointment.providerId,
          locationId: appointment.locationId,
          appointmentStart: appointment.appointmentStart,
          appointmentEnd: appointment.appointmentEnd,
          patientName: appointment.patientName,
          patientPhone: appointment.patientPhone,
          providerName: appointment.providerName,
          status: appointment.status,
          notes: appointment.notes,
          bookingSource: appointment.bookingSource,
          confirmedAt: appointment.confirmedAt,
          checkedInAt: appointment.checkedInAt,
          createdById: appointment.createdById,
        },
      }),
      this.prisma.client.appointmentStatusEvent.create({
        data: {
          id: statusEvent.id,
          appointmentId: statusEvent.appointmentId,
          previousStatus: statusEvent.previousStatus,
          newStatus: statusEvent.newStatus,
          changedById: statusEvent.changedById,
          changedAt: statusEvent.changedAt,
          notes: statusEvent.notes,
        },
      }),
    ]);

    return this.mapToEntity(createdAppointment);
  }

  /** @inheritdoc */
  async save(appointment: Appointment): Promise<Appointment> {
    const updatedAppointment = await this.prisma.client.appointment.update({
      where: {
        id: appointment.id,
      },
      data: {
        patientId: appointment.patientId,
        providerId: appointment.providerId,
        locationId: appointment.locationId,
        appointmentStart: appointment.appointmentStart,
        appointmentEnd: appointment.appointmentEnd,
        patientName: appointment.patientName,
        patientPhone: appointment.patientPhone,
        providerName: appointment.providerName,
        status: appointment.status,
        notes: appointment.notes,
        bookingSource: appointment.bookingSource,
        confirmedAt: appointment.confirmedAt,
        checkedInAt: appointment.checkedInAt,
      },
    });

    return this.mapToEntity(updatedAppointment);
  }

  /** @inheritdoc */
  async saveWithStatusEvent(
    appointment: Appointment,
    statusEvent: AppointmentStatusEvent,
  ): Promise<Appointment> {
    const [updatedAppointment] = await this.prisma.client.$transaction([
      this.prisma.client.appointment.update({
        where: {
          id: appointment.id,
        },
        data: {
          patientId: appointment.patientId,
          providerId: appointment.providerId,
          locationId: appointment.locationId,
          appointmentStart: appointment.appointmentStart,
          appointmentEnd: appointment.appointmentEnd,
          patientName: appointment.patientName,
          patientPhone: appointment.patientPhone,
          providerName: appointment.providerName,
          status: appointment.status,
          notes: appointment.notes,
          bookingSource: appointment.bookingSource,
          confirmedAt: appointment.confirmedAt,
          checkedInAt: appointment.checkedInAt,
        },
      }),
      this.prisma.client.appointmentStatusEvent.create({
        data: {
          id: statusEvent.id,
          appointmentId: statusEvent.appointmentId,
          previousStatus: statusEvent.previousStatus,
          newStatus: statusEvent.newStatus,
          changedById: statusEvent.changedById,
          changedAt: statusEvent.changedAt,
          notes: statusEvent.notes,
        },
      }),
    ]);

    return this.mapToEntity(updatedAppointment);
  }

  /** @inheritdoc */
  async softDelete(id: string): Promise<void> {
    await this.prisma.client.appointment.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /** @inheritdoc */
  async createStatusEvent(event: AppointmentStatusEvent): Promise<void> {
    await this.prisma.client.appointmentStatusEvent.create({
      data: {
        id: event.id,
        appointmentId: event.appointmentId,
        previousStatus: event.previousStatus,
        newStatus: event.newStatus,
        changedById: event.changedById,
        changedAt: event.changedAt,
        notes: event.notes,
      },
    });
  }

  /** @inheritdoc */
  async checkProviderAvailability(
    providerId: string,
    start: Date,
    end: Date,
    excludeAppointmentId?: string,
  ): Promise<boolean> {
    const conflictingAppointment =
      await this.prisma.client.appointment.findFirst({
        where: {
          providerId,
          deletedAt: null,
          status: {
            notIn: ['CANCELLED', 'NO_SHOW'],
          },
          ...(excludeAppointmentId && {
            id: { not: excludeAppointmentId },
          }),
          AND: [
            {
              appointmentStart: { lt: end },
            },
            {
              appointmentEnd: { gt: start },
            },
          ],
        },
      });

    return !conflictingAppointment;
  }

  /** @inheritdoc */
  mapToEntity(appointment: PrismaAppointment): Appointment {
    return new Appointment({
      id: appointment.id,
      clinicId: appointment.clinicId,
      patientId: appointment.patientId,
      providerId: appointment.providerId,
      locationId: appointment.locationId,
      appointmentStart: appointment.appointmentStart,
      appointmentEnd: appointment.appointmentEnd,
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone,
      providerName: appointment.providerName,
      status: appointment.status,
      notes: appointment.notes,
      bookingSource: appointment.bookingSource,
      confirmedAt: appointment.confirmedAt,
      checkedInAt: appointment.checkedInAt,
      createdById: appointment.createdById,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      deletedAt: appointment.deletedAt,
    });
  }

  /** @inheritdoc */
  mapStatusEventToEntity(event: PrismaStatusEvent): AppointmentStatusEvent {
    return new AppointmentStatusEvent({
      id: event.id,
      appointmentId: event.appointmentId,
      previousStatus: event.previousStatus,
      newStatus: event.newStatus,
      changedById: event.changedById,
      changedAt: event.changedAt,
      notes: event.notes,
    });
  }
}
