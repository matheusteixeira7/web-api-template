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
  UpdateAppointmentInputDto,
  UpdateAppointmentResponseDto,
} from '../dto/update-appointment.dto';
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
 * Use case for updating an existing appointment.
 */
@Injectable()
export class UpdateAppointmentUseCase {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly blockedTimeSlotsRepository: BlockedTimeSlotsRepository,
    @Inject(PatientsApi)
    private readonly patientsApi: PatientsApiType,
    @Inject(ProvidersApi)
    private readonly providersApi: ProvidersApiType,
  ) {}

  /**
   * Executes the appointment update operation.
   *
   * @param input - The appointment update data
   * @returns The updated appointment entity
   * @throws ResourceNotFoundError if appointment, patient, or provider not found
   */
  async execute(
    input: UpdateAppointmentInputDto,
  ): Promise<UpdateAppointmentResponseDto> {
    const { appointmentId, clinicId, ...updateData } = input;

    // Find existing appointment
    const appointment = await this.appointmentsRepository.findById(
      appointmentId,
      clinicId,
    );
    if (!appointment) {
      throw new ResourceNotFoundError();
    }

    // Determine the effective values after update
    const effectivePatientId = updateData.patientId ?? appointment.patientId;
    const effectiveProviderId = updateData.providerId ?? appointment.providerId;
    const effectiveLocationId =
      updateData.locationId !== undefined
        ? updateData.locationId
        : appointment.locationId;
    const effectiveStart =
      updateData.appointmentStart ?? appointment.appointmentStart;
    const effectiveEnd =
      updateData.appointmentEnd ?? appointment.appointmentEnd;

    // If patient changed, validate new patient
    let patientName = appointment.patientName;
    let patientPhone = appointment.patientPhone;
    if (updateData.patientId) {
      const patient = await this.patientsApi.findById(
        updateData.patientId,
        clinicId,
      );
      if (!patient) {
        throw new ResourceNotFoundError();
      }
      patientName = patient.name;
      patientPhone = patient.phone;
    }

    // If provider changed, validate new provider
    let providerName = appointment.providerName;
    let workingHours: WorkingHours | null = null;
    if (updateData.providerId) {
      const provider = await this.providersApi.findById(updateData.providerId);
      if (!provider || provider.clinicId !== clinicId) {
        throw new ResourceNotFoundError();
      }
      providerName = provider.name;
      workingHours = provider.workingHours as WorkingHours | null;
    } else {
      // Get current provider for working hours validation
      const provider = await this.providersApi.findById(appointment.providerId);
      if (provider) {
        workingHours = provider.workingHours as WorkingHours | null;
      }
    }

    // If time or provider changed, revalidate
    const timeOrProviderChanged =
      updateData.appointmentStart ||
      updateData.appointmentEnd ||
      updateData.providerId;

    if (timeOrProviderChanged) {
      // Validate working hours
      const isWithinWorkingHours = this.validateWithinWorkingHours(
        workingHours,
        effectiveStart,
        effectiveEnd,
      );
      if (!isWithinWorkingHours) {
        throw new OutsideWorkingHoursError();
      }

      // Check for blocked time slots
      const hasBlockedSlot =
        await this.blockedTimeSlotsRepository.hasOverlappingBlock(
          effectiveProviderId,
          effectiveStart,
          effectiveEnd,
          effectiveLocationId ?? undefined,
        );
      if (hasBlockedSlot) {
        throw new BlockedTimeSlotError();
      }

      // Check provider availability (excluding current appointment)
      const isAvailable =
        await this.appointmentsRepository.checkProviderAvailability(
          effectiveProviderId,
          effectiveStart,
          effectiveEnd,
          appointmentId,
        );
      if (!isAvailable) {
        throw new ProviderNotAvailableError();
      }
    }

    // Update appointment fields
    appointment.patientId = effectivePatientId;
    appointment.providerId = effectiveProviderId;
    appointment.locationId = effectiveLocationId;
    appointment.appointmentStart = effectiveStart;
    appointment.appointmentEnd = effectiveEnd;
    appointment.patientName = patientName;
    appointment.patientPhone = patientPhone;
    appointment.providerName = providerName;

    if (updateData.notes !== undefined) {
      appointment.notes = updateData.notes;
    }

    const updatedAppointment =
      await this.appointmentsRepository.save(appointment);

    return {
      appointment: updatedAppointment,
    };
  }

  private validateWithinWorkingHours(
    workingHours: WorkingHours | null,
    appointmentStart: Date,
    appointmentEnd: Date,
  ): boolean {
    if (!workingHours) {
      return true;
    }

    const dayOfWeek = appointmentStart.getDay();
    const dayKey = dayOfWeek.toString();
    const dayHours = workingHours[dayKey];

    if (!dayHours) {
      return false;
    }

    const startTime = this.formatTime(appointmentStart);
    const endTime = this.formatTime(appointmentEnd);

    return startTime >= dayHours.start && endTime <= dayHours.end;
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
