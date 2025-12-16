import { PatientsApi } from '@/shared/public-api/interface/patients-api.interface';
import { Injectable } from '@nestjs/common';
import type { FindPatientsPaginatedResponseDto } from '../../dto/find-patient.dto';
import { Patient } from '../../entities/patient.entity';
import type { FindPatientsFilters } from '../../types/patient-filters.types';
import { FindPatientByIdUseCase } from '../../use-cases/find-patient-by-id.usecase';
import { FindPatientByPhoneUseCase } from '../../use-cases/find-patient-by-phone.usecase';
import { FindPatientsByClinicUseCase } from '../../use-cases/find-patients-by-clinic.usecase';

/**
 * PatientsFacade - Public API implementation for Patients module.
 *
 * @remarks
 * This facade is a pure DELEGATION layer, not a business logic layer.
 * - Delegates to Use Cases (business logic)
 * - Does NOT call repositories directly
 * - Does NOT contain business rules
 * - Acts as public interface for external modules
 *
 * This is the ONLY way external modules should interact with the Patients module.
 *
 * @example
 * ```typescript
 * const patient = await patientsFacade.findById('patient-uuid', 'clinic-uuid');
 * ```
 */
@Injectable()
export class PatientsFacade implements PatientsApi {
  constructor(
    private readonly findPatientByIdUseCase: FindPatientByIdUseCase,
    private readonly findPatientsByClinicUseCase: FindPatientsByClinicUseCase,
    private readonly findPatientByPhoneUseCase: FindPatientByPhoneUseCase,
  ) {}

  /**
   * Finds a patient by their unique identifier within a specific clinic.
   *
   * @param id - The patient's UUID
   * @param clinicId - The clinic's UUID for access control
   * @returns The patient entity if found and belongs to the clinic, null otherwise
   */
  async findById(id: string, clinicId: string): Promise<Patient | null> {
    return this.findPatientByIdUseCase.execute({ patientId: id, clinicId });
  }

  /**
   * Finds all patients belonging to a clinic with optional filters.
   *
   * @param clinicId - The clinic's UUID
   * @param filters - Optional filter, sort, and pagination options
   * @returns Paginated response with patients and total count
   */
  async findByClinicId(
    clinicId: string,
    filters?: Partial<FindPatientsFilters>,
  ): Promise<FindPatientsPaginatedResponseDto> {
    return this.findPatientsByClinicUseCase.execute({
      clinicId,
      ...filters,
    });
  }

  /**
   * Finds a patient by their phone number within a clinic.
   *
   * @param clinicId - The clinic's UUID
   * @param phone - The patient's phone number
   * @returns The patient entity if found, null otherwise
   */
  async findByPhone(clinicId: string, phone: string): Promise<Patient | null> {
    return this.findPatientByPhoneUseCase.execute(clinicId, phone);
  }
}
