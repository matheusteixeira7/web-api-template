import { DatabaseModule } from '@/infra/database/database.module';
import { UsersModule } from '@/modules/users/users.module';
import { ClinicsApi } from '@/shared/public-api/interface/clinics-api.interface';
import { Module } from '@nestjs/common';
import { UpdateClinicSetupController } from './controllers/update-clinic-setup.controller';
import { ClinicsFacade } from './public-api/facade/clinics.facade';
import { ClinicsRepository } from './repositories/clinics.repository';
import { PrismaClinicsRepository } from './repositories/prisma-clinics-repository';
import { CreateClinicUseCase } from './use-cases/create-clinic.usecase';
import { FindClinicUseCase } from './use-cases/find-clinic.usecase';
import { UpdateClinicSetupUseCase } from './use-cases/update-clinic-setup.usecase';
import { VerifyUserBelongsToClinicUseCase } from './use-cases/verify-user-belongs-to-clinic.usecase';

/**
 * ClinicsModule - Clinics domain module
 *
 * This module follows Clean Architecture with Facade Pattern:
 * - Exports ONLY ClinicsApi (interface Symbol) - public API
 * - Uses NestJS DI (no manual factories)
 * - Imports UsersModule to get UsersApi (for cross-module authorization)
 */
@Module({
  imports: [
    DatabaseModule,
    UsersModule, // ✨ Import to get UsersApi (for cross-module authorization)
  ],
  controllers: [UpdateClinicSetupController],
  providers: [
    // Repository binding (internal, used by use cases)
    { provide: ClinicsRepository, useClass: PrismaClinicsRepository },

    // Use cases (internal, used by facade and controllers)
    FindClinicUseCase,
    CreateClinicUseCase,
    UpdateClinicSetupUseCase,
    VerifyUserBelongsToClinicUseCase,

    // Facade binding
    ClinicsFacade,
    { provide: ClinicsApi, useExisting: ClinicsFacade },
  ],
  exports: [
    ClinicsApi, // ✅ Export interface (Symbol) - public API
  ],
})
export class ClinicsModule {}
