import { DatabaseModule } from '@/infra/database/database.module';
import { PatientsApi } from '@/shared/public-api/interface/patients-api.interface';
import { Module } from '@nestjs/common';
import { PatientsController } from './controllers/patients.controller';
import { PatientsFacade } from './public-api/facade/patients.facade';
import { PrismaPatientsRepository } from './repositories/prisma-patients-repository';
import { PatientsRepository } from './repositories/patients.repository';
import { CreatePatientUseCase } from './use-cases/create-patient.usecase';
import { DeletePatientUseCase } from './use-cases/delete-patient.usecase';
import { FindPatientByIdUseCase } from './use-cases/find-patient-by-id.usecase';
import { FindPatientByPhoneUseCase } from './use-cases/find-patient-by-phone.usecase';
import { FindPatientsByClinicUseCase } from './use-cases/find-patients-by-clinic.usecase';
import { UpdatePatientUseCase } from './use-cases/update-patient.usecase';

/**
 * PatientsModule - Patients domain module.
 *
 * @remarks
 * This module follows Clean Architecture with the Facade Pattern:
 * - Exports ONLY `PatientsApi` (interface Symbol) as the public API
 * - Uses NestJS DI (no manual factories)
 * - Repositories are internal (not exported)
 * - Use cases are internal (not exported)
 * - Facade delegates to use cases
 *
 * External modules should inject `PatientsApi` to interact with this module.
 *
 * @example
 * ```typescript
 * // In another module
 * constructor(@Inject(PatientsApi) private readonly patientsApi: PatientsApi) {}
 * ```
 */
@Module({
  imports: [DatabaseModule],
  controllers: [PatientsController],
  providers: [
    // Repository binding (internal, used by use cases)
    { provide: PatientsRepository, useClass: PrismaPatientsRepository },

    // Use cases (internal, used by facade and controllers)
    CreatePatientUseCase,
    FindPatientByIdUseCase,
    FindPatientsByClinicUseCase,
    FindPatientByPhoneUseCase,
    UpdatePatientUseCase,
    DeletePatientUseCase,

    // Facade binding - uses Symbol token
    PatientsFacade,
    { provide: PatientsApi, useExisting: PatientsFacade },
  ],
  exports: [
    PatientsApi, // Export interface (Symbol) - public API
  ],
})
export class PatientsModule {}
