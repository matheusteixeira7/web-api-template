import { Module } from '@nestjs/common';
import { UpdateClinicSetupController } from './controllers/update-clinic-setup.controller';
import { UpdateClinicSetupUseCase } from './use-cases/update-clinic-setup.usecase';
import { makeUpdateClinicSetupUseCase } from './use-cases/factories/make-update-clinic-setup-use-case.factory';

@Module({
  controllers: [UpdateClinicSetupController],
  providers: [
    {
      provide: UpdateClinicSetupUseCase,
      useFactory: makeUpdateClinicSetupUseCase,
    },
  ],
  exports: [
    {
      provide: UpdateClinicSetupUseCase,
      useFactory: makeUpdateClinicSetupUseCase,
    },
  ],
})
export class ClinicsModule {}
