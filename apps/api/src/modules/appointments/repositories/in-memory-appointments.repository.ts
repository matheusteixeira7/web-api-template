import type {
  Appointment as PrismaAppointment,
  AppointmentStatusEvent as PrismaStatusEvent,
} from '@workspace/database';
import { AppointmentStatusEvent } from '../entities/appointment-status-event.entity';
import { Appointment } from '../entities/appointment.entity';
import type { FindAppointmentsFilters } from '../types/appointment-filters.types';
import { AppointmentsRepository } from './appointments.repository';

/**
 * In-memory implementation of AppointmentsRepository for testing.
 */
export class InMemoryAppointmentsRepository extends AppointmentsRepository {
  public items: Appointment[] = [];
  public statusEvents: AppointmentStatusEvent[] = [];

  findById(id: string, clinicId: string): Promise<Appointment | null> {
    const appointment = this.items.find(
      (item) => item.id === id && item.clinicId === clinicId && !item.deletedAt,
    );
    return Promise.resolve(appointment ?? null);
  }

  findByClinicId(
    clinicId: string,
    filters: FindAppointmentsFilters,
  ): Promise<{ appointments: Appointment[]; total: number }> {
    const baseFiltered = this.items.filter(
      (item) => item.clinicId === clinicId && !item.deletedAt,
    );
    return Promise.resolve(this.applyFiltersAndPagination(baseFiltered, filters));
  }

  findByProviderId(
    providerId: string,
    clinicId: string,
    filters: FindAppointmentsFilters,
  ): Promise<{ appointments: Appointment[]; total: number }> {
    const baseFiltered = this.items.filter(
      (item) =>
        item.providerId === providerId &&
        item.clinicId === clinicId &&
        !item.deletedAt,
    );
    return Promise.resolve(this.applyFiltersAndPagination(baseFiltered, filters));
  }

  findByPatientId(
    patientId: string,
    clinicId: string,
    filters: FindAppointmentsFilters,
  ): Promise<{ appointments: Appointment[]; total: number }> {
    const baseFiltered = this.items.filter(
      (item) =>
        item.patientId === patientId &&
        item.clinicId === clinicId &&
        !item.deletedAt,
    );
    return Promise.resolve(this.applyFiltersAndPagination(baseFiltered, filters));
  }

  /**
   * Private helper method to apply common filters, sorting, and pagination.
   * @param items - Base filtered array of appointments
   * @param filters - Filter, sort, and pagination options
   * @returns Object containing filtered appointments and total count
   */
  private applyFiltersAndPagination(
    items: Appointment[],
    filters: FindAppointmentsFilters,
  ): { appointments: Appointment[]; total: number } {
    let filtered = [...items];

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    // Apply date range filter
    if (filters.startDate) {
      filtered = filtered.filter(
        (item) => item.appointmentStart >= filters.startDate,
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(
        (item) => item.appointmentStart <= filters.endDate,
      );
    }

    // Apply optional filters (used by findByClinicId)
    if (filters.providerId) {
      filtered = filtered.filter(
        (item) => item.providerId === filters.providerId,
      );
    }
    if (filters.patientId) {
      filtered = filtered.filter(
        (item) => item.patientId === filters.patientId,
      );
    }
    if (filters.locationId) {
      filtered = filtered.filter(
        (item) => item.locationId === filters.locationId,
      );
    }

    const total = filtered.length;

    // Apply sorting
    const sortDir = filters.sortDir === 'desc' ? -1 : 1;
    filtered.sort((a, b) => {
      const aVal = a[filters.sortBy as keyof Appointment];
      const bVal = b[filters.sortBy as keyof Appointment];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (aVal < bVal) return -1 * sortDir;
      if (aVal > bVal) return 1 * sortDir;
      return 0;
    });

    // Apply pagination
    const start = (filters.page - 1) * filters.perPage;
    const appointments = filtered.slice(start, start + filters.perPage);

    return { appointments, total };
  }

  create(data: Appointment): Promise<Appointment> {
    this.items.push(data);
    return Promise.resolve(data);
  }

  createWithStatusEvent(
    appointment: Appointment,
    statusEvent: AppointmentStatusEvent,
  ): Promise<Appointment> {
    // In-memory implementation: add both to their respective arrays
    // In production, this is wrapped in a transaction
    this.items.push(appointment);
    this.statusEvents.push(statusEvent);
    return Promise.resolve(appointment);
  }

  save(appointment: Appointment): Promise<Appointment> {
    const index = this.items.findIndex((item) => item.id === appointment.id);
    if (index >= 0) {
      this.items[index] = appointment;
    }
    return Promise.resolve(appointment);
  }

  saveWithStatusEvent(
    appointment: Appointment,
    statusEvent: AppointmentStatusEvent,
  ): Promise<Appointment> {
    const index = this.items.findIndex((item) => item.id === appointment.id);
    if (index >= 0) {
      this.items[index] = appointment;
    }
    this.statusEvents.push(statusEvent);
    return Promise.resolve(appointment);
  }

  softDelete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index >= 0) {
      this.items[index].deletedAt = new Date();
    }
    return Promise.resolve();
  }

  createStatusEvent(event: AppointmentStatusEvent): Promise<void> {
    this.statusEvents.push(event);
    return Promise.resolve();
  }

  checkProviderAvailability(
    providerId: string,
    start: Date,
    end: Date,
    excludeAppointmentId?: string,
  ): Promise<boolean> {
    const conflicting = this.items.find(
      (item) =>
        item.providerId === providerId &&
        !item.deletedAt &&
        item.status !== 'CANCELLED' &&
        item.status !== 'NO_SHOW' &&
        item.id !== excludeAppointmentId &&
        item.appointmentStart < end &&
        item.appointmentEnd > start,
    );
    return Promise.resolve(!conflicting);
  }

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
