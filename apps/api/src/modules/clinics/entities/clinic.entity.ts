import type { WithOptional } from '@/shared/core/default.entity';
import { randomUUID } from 'crypto';

export class Clinic {
  id: string;
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  businessHours: object | null;
  timezone: string | null;
  averageAppointmentValue: number | null;
  subscriptionId: string | null;
  isSetupComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(
    data: WithOptional<
      Clinic,
      | 'id'
      | 'contactEmail'
      | 'contactPhone'
      | 'businessHours'
      | 'timezone'
      | 'averageAppointmentValue'
      | 'subscriptionId'
      | 'isSetupComplete'
      | 'createdAt'
      | 'updatedAt'
      | 'deletedAt'
    >,
  ) {
    Object.assign(this, {
      ...data,
      id: data.id || randomUUID(),
      contactEmail: data.contactEmail ?? null,
      contactPhone: data.contactPhone ?? null,
      businessHours: data.businessHours ?? null,
      timezone: data.timezone ?? null,
      averageAppointmentValue: data.averageAppointmentValue ?? null,
      subscriptionId: data.subscriptionId ?? null,
      isSetupComplete: data.isSetupComplete ?? false,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt ?? null,
    });
  }
}
