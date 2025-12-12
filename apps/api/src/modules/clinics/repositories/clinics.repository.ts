import { Clinic } from '../entities/clinic.entity';

export abstract class ClinicsRepository {
  abstract findById(id: string): Promise<Clinic | null>;
  abstract create(data: Clinic): Promise<Clinic>;
  abstract save(clinic: Clinic): Promise<Clinic>;
}
