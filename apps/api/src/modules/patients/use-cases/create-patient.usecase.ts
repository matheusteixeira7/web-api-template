import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@workspace/database';
import type {
  CreatePatientInputDto,
  CreatePatientResponseDto,
} from '../dto/create-patient.dto';
import { Patient } from '../entities/patient.entity';
import { PatientsRepository } from '../repositories/patients.repository';

/**
 * Use case for creating a new patient.
 *
 * @remarks
 * Creates a patient entity and persists it to the database.
 * Handles CPF document creation if provided.
 */
@Injectable()
export class CreatePatientUseCase {
  constructor(private readonly patientsRepository: PatientsRepository) {}

  /**
   * Creates a new patient.
   *
   * @param input - The patient creation data including clinic context
   * @returns The created patient wrapped in response DTO
   * @throws ConflictException if CPF already exists for another patient in the clinic
   */
  async execute(
    input: CreatePatientInputDto,
  ): Promise<CreatePatientResponseDto> {
    const patient = new Patient({
      clinicId: input.clinicId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      dateOfBirth: input.dateOfBirth,
      medicalRecordId: input.medicalRecordId,
      notes: input.notes,
    });

    const createdPatient = await this.patientsRepository.create(patient);

    // Create CPF document if provided
    if (input.cpf) {
      try {
        await this.patientsRepository.upsertCpfDocument(
          createdPatient.id,
          input.clinicId,
          input.cpf,
        );
      } catch (error) {
        // Rollback patient creation on CPF conflict
        await this.patientsRepository.softDelete(createdPatient.id);

        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException(
            'Ja existe um paciente com este CPF nesta clinica',
          );
        }
        throw error;
      }

      // Refetch patient with documents
      const patientWithDocs = await this.patientsRepository.findById(
        createdPatient.id,
        input.clinicId,
      );
      return { patient: patientWithDocs! };
    }

    return { patient: createdPatient };
  }
}
