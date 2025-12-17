import {
  AppointmentsApi,
  type AppointmentsApi as AppointmentsApiType,
} from '@/shared/public-api/interface/appointments-api.interface';
import {
  ClinicsApi,
  type ClinicsApi as ClinicsApiType,
} from '@/shared/public-api/interface/clinics-api.interface';
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import { Inject, Injectable } from '@nestjs/common';
import {
  addMinutes,
  eachDayOfInterval,
  format,
  getDay,
  setHours,
  setMinutes,
} from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import type {
  DayAvailability,
  ProviderAvailabilityQueryDto,
  ProviderAvailabilityResponseDto,
  TimeSlot,
} from '../dto/provider-availability.dto';
import { ProvidersRepository } from '../repositories/providers.repository';

interface WorkingHoursDay {
  start: string;
  end: string;
}

interface WorkingHours {
  [key: string]: WorkingHoursDay | undefined;
}

interface GetProviderAvailabilityInput extends ProviderAvailabilityQueryDto {
  providerId: string;
  clinicId: string;
}

/**
 * Use case for getting available time slots for a provider.
 *
 * @remarks
 * Calculates available appointment slots based on:
 * - Provider's working hours
 * - Provider's default appointment duration
 * - Existing appointments (excluded)
 * - Blocked time slots (excluded)
 */
@Injectable()
export class GetProviderAvailabilityUseCase {
  constructor(
    private readonly providersRepository: ProvidersRepository,
    @Inject(ClinicsApi)
    private readonly clinicsApi: ClinicsApiType,
    @Inject(AppointmentsApi)
    private readonly appointmentsApi: AppointmentsApiType,
  ) {}

  /**
   * Executes the availability calculation.
   *
   * @param input - Provider ID, clinic ID, and date range
   * @returns Available time slots organized by day
   * @throws ResourceNotFoundError if provider or clinic not found
   */
  async execute(
    input: GetProviderAvailabilityInput,
  ): Promise<ProviderAvailabilityResponseDto> {
    const { providerId, clinicId, startDate, endDate } = input;

    // 1. Fetch provider and validate clinic ownership
    const provider = await this.providersRepository.findById(providerId);
    if (!provider || provider.clinicId !== clinicId) {
      throw new ResourceNotFoundError();
    }

    // 2. Fetch clinic for timezone
    const clinic = await this.clinicsApi.findById(clinicId);
    if (!clinic) {
      throw new ResourceNotFoundError();
    }
    const timezone = clinic.timezone ?? 'America/Sao_Paulo';

    // 3. Fetch appointments in date range
    const appointments = await this.appointmentsApi.findByProviderForDateRange(
      providerId,
      clinicId,
      startDate,
      endDate,
    );

    // 4. Fetch blocked time slots in date range
    const blockedSlots = await this.appointmentsApi.findBlockedSlotsByProvider(
      providerId,
      startDate,
      endDate,
    );

    // 5. Generate availability for each day
    const workingHours = provider.workingHours as WorkingHours | null;
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const availability: DayAvailability[] = [];

    for (const day of days) {
      const dayOfWeek = getDay(day);
      const dayKey = dayOfWeek.toString();
      const dayHours = workingHours?.[dayKey];

      if (!dayHours) {
        // Provider doesn't work this day
        availability.push({
          date: format(day, 'yyyy-MM-dd'),
          dayOfWeek,
          slots: [],
        });
        continue;
      }

      // Generate raw slots based on working hours
      const rawSlots = this.generateSlotsForDay(
        day,
        dayHours,
        provider.defaultAppointmentDuration,
        timezone,
      );

      // Filter out conflicts with appointments and blocked slots
      const availableSlots = this.filterConflicts(
        rawSlots,
        appointments,
        blockedSlots,
      );

      availability.push({
        date: format(day, 'yyyy-MM-dd'),
        dayOfWeek,
        slots: availableSlots,
      });
    }

    return {
      providerId: provider.id,
      providerName: provider.name,
      defaultAppointmentDuration: provider.defaultAppointmentDuration,
      timezone,
      availability,
    };
  }

  /**
   * Generates time slots for a single day based on working hours.
   */
  private generateSlotsForDay(
    day: Date,
    workingHours: WorkingHoursDay,
    slotDuration: number,
    timezone: string,
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const [startHour, startMin] = workingHours.start.split(':').map(Number);
    const [endHour, endMin] = workingHours.end.split(':').map(Number);

    // Create times in clinic timezone, then convert to UTC
    let currentZoned = setMinutes(setHours(day, startHour), startMin);
    const workEndZoned = setMinutes(setHours(day, endHour), endMin);

    while (addMinutes(currentZoned, slotDuration) <= workEndZoned) {
      const slotStart = fromZonedTime(currentZoned, timezone);
      const slotEnd = fromZonedTime(addMinutes(currentZoned, slotDuration), timezone);

      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
      });

      currentZoned = addMinutes(currentZoned, slotDuration);
    }

    return slots;
  }

  /**
   * Filters out slots that conflict with existing appointments or blocked time slots.
   */
  private filterConflicts(
    slots: TimeSlot[],
    appointments: Array<{
      appointmentStart: Date;
      appointmentEnd: Date;
      status: string;
    }>,
    blockedSlots: Array<{ startDatetime: Date; endDatetime: Date }>,
  ): TimeSlot[] {
    // Filter out cancelled/no-show appointments
    const activeAppointments = appointments.filter(
      (apt) => apt.status !== 'CANCELLED' && apt.status !== 'NO_SHOW',
    );

    return slots.filter((slot) => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);

      // Check appointment conflicts
      const hasAppointmentConflict = activeAppointments.some((apt) =>
        this.rangesOverlap(
          slotStart,
          slotEnd,
          apt.appointmentStart,
          apt.appointmentEnd,
        ),
      );
      if (hasAppointmentConflict) return false;

      // Check blocked slot conflicts
      const hasBlockedConflict = blockedSlots.some((blocked) =>
        this.rangesOverlap(
          slotStart,
          slotEnd,
          blocked.startDatetime,
          blocked.endDatetime,
        ),
      );
      if (hasBlockedConflict) return false;

      return true;
    });
  }

  /**
   * Checks if two time ranges overlap.
   */
  private rangesOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date,
  ): boolean {
    return start1 < end2 && end1 > start2;
  }
}
