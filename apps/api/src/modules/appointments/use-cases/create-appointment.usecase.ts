import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import {
  ClinicsApi,
  type ClinicsApi as ClinicsApiType,
} from '@/shared/public-api/interface/clinics-api.interface';
import {
  PatientsApi,
  type PatientsApi as PatientsApiType,
} from '@/shared/public-api/interface/patients-api.interface';
import {
  ProvidersApi,
  type ProvidersApi as ProvidersApiType,
} from '@/shared/public-api/interface/providers-api.interface';
import { Inject, Injectable } from '@nestjs/common';
import { getDay, getHours, getMinutes } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type {
  CreateAppointmentInputDto,
  CreateAppointmentResponseDto,
} from '../dto/create-appointment.dto';
import { AppointmentStatusEvent } from '../entities/appointment-status-event.entity';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentsRepository } from '../repositories/appointments.repository';
import { BlockedTimeSlotsRepository } from '../repositories/blocked-time-slots.repository';
import { AppointmentSpansMidnightError } from './errors/appointment-spans-midnight.error';
import { BlockedTimeSlotError } from './errors/blocked-time-slot.error';
import { OutsideWorkingHoursError } from './errors/outside-working-hours.error';
import { ProviderNotAvailableError } from './errors/provider-not-available.error';

interface WorkingHoursDay {
  start: string;
  end: string;
}

interface WorkingHours {
  [key: string]: WorkingHoursDay | undefined;
}

/**
 * Use case for creating a new appointment.
 *
 * @remarks
 * Validates provider availability, working hours, and blocked time slots
 * before creating the appointment.
 */
@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly blockedTimeSlotsRepository: BlockedTimeSlotsRepository,
    @Inject(ClinicsApi)
    private readonly clinicsApi: ClinicsApiType,
    @Inject(PatientsApi)
    private readonly patientsApi: PatientsApiType,
    @Inject(ProvidersApi)
    private readonly providersApi: ProvidersApiType,
  ) {}

  /**
   * Executes the appointment creation operation.
   *
   * @param input - The appointment creation data
   * @returns The created appointment entity
   * @throws ResourceNotFoundError if patient or provider not found
   * @throws ProviderNotAvailableError if provider has conflicting appointment
   * @throws OutsideWorkingHoursError if time is outside working hours
   * @throws BlockedTimeSlotError if provider has blocked time slot
   */
  async execute(
    input: CreateAppointmentInputDto,
  ): Promise<CreateAppointmentResponseDto> {
    const {
      clinicId,
      patientId,
      providerId,
      locationId,
      appointmentStart,
      appointmentEnd,
      notes,
      bookingSource,
      createdById,
    } = input;

    // 1. Validate patient exists and belongs to clinic
    const patient = await this.patientsApi.findById(patientId, clinicId);
    if (!patient) {
      throw new ResourceNotFoundError();
    }

    // 2. Validate provider exists
    const provider = await this.providersApi.findById(providerId);
    if (!provider || provider.clinicId !== clinicId) {
      throw new ResourceNotFoundError();
    }

    // 3. Get clinic for timezone
    const clinic = await this.clinicsApi.findById(clinicId);
    if (!clinic) {
      throw new ResourceNotFoundError();
    }

    // 4. Validate appointment is within working hours
    this.validateWithinWorkingHours(
      provider.workingHours as WorkingHours | null,
      appointmentStart,
      appointmentEnd,
      clinic.timezone ?? 'America/Sao_Paulo',
    );

    // 5. Check for blocked time slots
    const hasBlockedSlot =
      await this.blockedTimeSlotsRepository.hasOverlappingBlock(
        providerId,
        appointmentStart,
        appointmentEnd,
        locationId ?? undefined,
      );
    if (hasBlockedSlot) {
      throw new BlockedTimeSlotError();
    }

    // 6. Check provider availability (no conflicting appointments)
    const isAvailable =
      await this.appointmentsRepository.checkProviderAvailability(
        providerId,
        appointmentStart,
        appointmentEnd,
      );
    if (!isAvailable) {
      throw new ProviderNotAvailableError();
    }

    // 7. Create appointment with denormalized data
    const appointment = new Appointment({
      clinicId,
      patientId,
      providerId,
      locationId: locationId ?? null,
      appointmentStart,
      appointmentEnd,
      patientName: patient.name,
      patientPhone: patient.phone,
      providerName: provider.name,
      notes: notes ?? null,
      bookingSource: bookingSource ?? 'MANUAL',
      createdById: createdById ?? null,
      status: 'SCHEDULED',
    });

    // 8. Create initial status event (will be created in same transaction)
    const statusEvent = new AppointmentStatusEvent({
      appointmentId: appointment.id,
      previousStatus: null,
      newStatus: 'SCHEDULED',
      changedById: createdById ?? null,
      notes: 'Appointment created',
    });

    // 9. Create appointment and status event in a single transaction
    const createdAppointment =
      await this.appointmentsRepository.createWithStatusEvent(
        appointment,
        statusEvent,
      );

    return {
      appointment: createdAppointment,
    };
  }

  /**
   * Validates that the appointment time is within provider working hours.
   * Converts times to the clinic's timezone for accurate comparison.
   *
   * @throws AppointmentSpansMidnightError if appointment crosses midnight
   * @throws OutsideWorkingHoursError if appointment is outside working hours
   */
  private validateWithinWorkingHours(
    workingHours: WorkingHours | null,
    appointmentStart: Date,
    appointmentEnd: Date,
    timezone: string,
  ): void {
    // If no working hours defined, allow any time
    if (!workingHours) {
      return;
    }

    // Convert to clinic's timezone for accurate comparison
    const zonedStart = toZonedTime(appointmentStart, timezone);
    const zonedEnd = toZonedTime(appointmentEnd, timezone);

    // Reject appointments that span midnight
    if (getDay(zonedStart) !== getDay(zonedEnd)) {
      throw new AppointmentSpansMidnightError();
    }

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = getDay(zonedStart);
    const dayKey = dayOfWeek.toString();
    const dayHours = workingHours[dayKey];

    // If no hours for this day, provider doesn't work
    if (!dayHours) {
      throw new OutsideWorkingHoursError();
    }

    // Format times as HH:mm for comparison
    const startTime = this.formatTime(zonedStart);
    const endTime = this.formatTime(zonedEnd);

    if (startTime < dayHours.start || endTime > dayHours.end) {
      throw new OutsideWorkingHoursError();
    }
  }

  /**
   * Formats a date to HH:mm string.
   */
  private formatTime(date: Date): string {
    const hours = getHours(date).toString().padStart(2, '0');
    const minutes = getMinutes(date).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
