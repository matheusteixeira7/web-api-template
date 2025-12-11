import { PrismaClinicsRepository } from '@/modules/clinics/repositories/prisma-clinics-repository';
import { UpdateClinicSetupUseCase } from '@/modules/clinics/use-cases/update-clinic-setup.usecase';

export function makeUpdateClinicSetupUseCase() {
  const clinicsRepository = new PrismaClinicsRepository();
  const useCase = new UpdateClinicSetupUseCase(clinicsRepository);

  return useCase;
}
