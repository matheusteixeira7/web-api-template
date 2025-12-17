import { z } from "zod";

export const timeSlotSchema = z.object({
  start: z.string(),
  end: z.string(),
});

export const dayAvailabilitySchema = z.object({
  date: z.string(),
  dayOfWeek: z.number(),
  slots: z.array(timeSlotSchema),
});

export const availabilityResponseSchema = z.object({
  providerId: z.string().uuid(),
  providerName: z.string(),
  defaultAppointmentDuration: z.number(),
  timezone: z.string(),
  availability: z.array(dayAvailabilitySchema),
});

export type TimeSlot = z.infer<typeof timeSlotSchema>;
export type DayAvailability = z.infer<typeof dayAvailabilitySchema>;
export type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;
