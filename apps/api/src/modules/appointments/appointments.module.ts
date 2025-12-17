import { DatabaseModule } from '@/infra/database/database.module';
import { AppointmentsApi } from '@/shared/public-api/interface/appointments-api.interface';
import { Module } from '@nestjs/common';
import { PatientsModule } from '../patients/patients.module';
import { ProvidersModule } from '../providers/providers.module';

// Controllers
import { AppointmentsController } from './controllers/appointments.controller';
import { BlockedTimeSlotsController } from './controllers/blocked-time-slots.controller';

// Repositories
import { AppointmentsRepository } from './repositories/appointments.repository';
import { BlockedTimeSlotsRepository } from './repositories/blocked-time-slots.repository';
import { PrismaAppointmentsRepository } from './repositories/prisma-appointments.repository';
import { PrismaBlockedTimeSlotsRepository } from './repositories/prisma-blocked-time-slots.repository';

// Use Cases - Appointments
import { CancelAppointmentUseCase } from './use-cases/cancel-appointment.usecase';
import { CreateAppointmentUseCase } from './use-cases/create-appointment.usecase';
import { DeleteAppointmentUseCase } from './use-cases/delete-appointment.usecase';
import { FindAppointmentByIdUseCase } from './use-cases/find-appointment-by-id.usecase';
import { FindAppointmentsByClinicUseCase } from './use-cases/find-appointments-by-clinic.usecase';
import { FindAppointmentsByPatientUseCase } from './use-cases/find-appointments-by-patient.usecase';
import { FindAppointmentsByProviderUseCase } from './use-cases/find-appointments-by-provider.usecase';
import { UpdateAppointmentUseCase } from './use-cases/update-appointment.usecase';
import { UpdateAppointmentStatusUseCase } from './use-cases/update-appointment-status.usecase';

// Use Cases - Blocked Time Slots
import { CreateBlockedTimeSlotUseCase } from './use-cases/create-blocked-time-slot.usecase';
import { DeleteBlockedTimeSlotUseCase } from './use-cases/delete-blocked-time-slot.usecase';
import { FindBlockedTimeSlotsUseCase } from './use-cases/find-blocked-time-slots.usecase';

// Facade
import { AppointmentsFacade } from './public-api/facade/appointments.facade';

/**
 * Appointments module handling all appointment-related functionality.
 *
 * @remarks
 * Provides CRUD operations for appointments and blocked time slots.
 * Depends on PatientsModule and ProvidersModule for cross-module communication.
 *
 * Exports only the AppointmentsApi Symbol for external module access.
 */
@Module({
  imports: [DatabaseModule, PatientsModule, ProvidersModule],
  controllers: [AppointmentsController, BlockedTimeSlotsController],
  providers: [
    // Repository bindings
    {
      provide: AppointmentsRepository,
      useClass: PrismaAppointmentsRepository,
    },
    {
      provide: BlockedTimeSlotsRepository,
      useClass: PrismaBlockedTimeSlotsRepository,
    },

    // Appointment Use Cases
    CreateAppointmentUseCase,
    FindAppointmentByIdUseCase,
    FindAppointmentsByClinicUseCase,
    FindAppointmentsByProviderUseCase,
    FindAppointmentsByPatientUseCase,
    UpdateAppointmentUseCase,
    UpdateAppointmentStatusUseCase,
    CancelAppointmentUseCase,
    DeleteAppointmentUseCase,

    // Blocked Time Slot Use Cases
    CreateBlockedTimeSlotUseCase,
    FindBlockedTimeSlotsUseCase,
    DeleteBlockedTimeSlotUseCase,

    // Facade binding with Symbol token
    AppointmentsFacade,
    {
      provide: AppointmentsApi,
      useExisting: AppointmentsFacade,
    },
  ],
  exports: [AppointmentsApi],
})
export class AppointmentsModule {}
