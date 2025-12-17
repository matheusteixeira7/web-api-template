import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import {
  PatientsApi,
  type PatientsApi as PatientsApiType,
} from '@/shared/public-api/interface/patients-api.interface';
import {
  ProvidersApi,
  type ProvidersApi as ProvidersApiType,
} from '@/shared/public-api/interface/providers-api.interface';
import { Inject, Injectable } from '@nestjs/common';
import type {
  CreateAppointmentInputDto,
  CreateAppointmentResponseDto,
} from '../dto/create-appointment.dto';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentStatusEvent } from '../entities/appointment-status-event.entity';
import { AppointmentsRepository } from '../repositories/appointments.repository';
import { BlockedTimeSlotsRepository } from '../repositories/blocked-time-slots.repository';
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

    // 3. Validate appointment is within working hours
    const isWithinWorkingHours = this.validateWithinWorkingHours(
      provider.workingHours as WorkingHours | null,
      appointmentStart,
      appointmentEnd,
    );
    if (!isWithinWorkingHours) {
      throw new OutsideWorkingHoursError();
    }

    // 4. Check for blocked time slots
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

    // 5. Check provider availability (no conflicting appointments)
    const isAvailable =
      await this.appointmentsRepository.checkProviderAvailability(
        providerId,
        appointmentStart,
        appointmentEnd,
      );
    if (!isAvailable) {
      throw new ProviderNotAvailableError();
    }

    // 6. Create appointment with denormalized data
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

    const createdAppointment =
      await this.appointmentsRepository.create(appointment);

    // 7. Create initial status event
    const statusEvent = new AppointmentStatusEvent({
      appointmentId: createdAppointment.id,
      previousStatus: null,
      newStatus: 'SCHEDULED',
      changedById: createdById ?? null,
      notes: 'Appointment created',
    });
    await this.appointmentsRepository.createStatusEvent(statusEvent);

    return {
      appointment: createdAppointment,
    };
  }

  /**
   * Validates that the appointment time is within provider working hours.
   */
  private validateWithinWorkingHours(
    workingHours: WorkingHours | null,
    appointmentStart: Date,
    appointmentEnd: Date,
  ): boolean {
    // If no working hours defined, allow any time
    if (!workingHours) {
      return true;
    }

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = appointmentStart.getDay();
    const dayKey = dayOfWeek.toString();
    const dayHours = workingHours[dayKey];

    // If no hours for this day, provider doesn't work
    if (!dayHours) {
      return false;
    }

    // Format times as HH:mm for comparison
    const startTime = this.formatTime(appointmentStart);
    const endTime = this.formatTime(appointmentEnd);

    return startTime >= dayHours.start && endTime <= dayHours.end;
  }

  /**
   * Formats a date to HH:mm string.
   */
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
