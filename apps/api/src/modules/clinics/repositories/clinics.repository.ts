import { User } from '@/modules/users/entities/user.entity';
import { Clinic } from '../entities/clinic.entity';

export abstract class ClinicsRepository {
  abstract findById(id: string): Promise<Clinic | null>;
  abstract create(data: Clinic): Promise<Clinic>;
  abstract save(clinic: Clinic): Promise<Clinic>;
  abstract createWithFirstUser(
    clinicData: { name: string },
    userData: {
      name: string;
      email: string;
      password: string | null;
      emailVerified: boolean;
    },
  ): Promise<User>;
}
