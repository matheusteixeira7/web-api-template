import { PrismaService } from '@/infra/database/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  DocumentType as PrismaDocumentType,
  Patient as PrismaPatient,
  PatientDocument as PrismaPatientDocument,
} from '@workspace/database';
import { Patient } from '../entities/patient.entity';
import type { FindPatientsFilters } from '../types/patient-filters.types';
import { PatientsRepository } from './patients.repository';

/** Prisma patient with documents included */
type PrismaPatientWithDocuments = PrismaPatient & {
  documents: (PrismaPatientDocument & { documentType: PrismaDocumentType })[];
};

/**
 * Prisma implementation of the PatientsRepository.
 * Handles all patient database operations using Prisma ORM.
 */
@Injectable()
export class PrismaPatientsRepository extends PatientsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /** Include clause for documents */
  private readonly documentsInclude = {
    documents: {
      include: { documentType: true },
    },
  } as const;

  /** @inheritdoc */
  async findById(id: string, clinicId: string): Promise<Patient | null> {
    const patient = await this.prisma.client.patient.findFirst({
      where: {
        id,
        clinicId,
        deletedAt: null,
      },
      include: this.documentsInclude,
    });

    if (!patient) {
      return null;
    }

    return this.mapToEntity(patient);
  }

  /** @inheritdoc */
  async findByClinicId(
    clinicId: string,
    filters: FindPatientsFilters,
  ): Promise<{ patients: Patient[]; total: number }> {
    const { search, status, sortBy, sortDir, page, perPage } = filters;

    // Build where clause
    const where: Prisma.PatientWhereInput = {
      clinicId,
    };

    // Status filter
    if (status === 'active') {
      where.deletedAt = null;
    } else if (status === 'inactive') {
      where.deletedAt = { not: null };
    }
    // 'all' includes both active and inactive

    // Search filter (case-insensitive search on name, phone, email, or CPF)
    if (search) {
      // Normalize search for CPF (remove non-digits)
      const normalizedSearch = search.replace(/\D/g, '');

      const searchConditions: Prisma.PatientWhereInput[] = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { medicalRecordId: { contains: search, mode: 'insensitive' } },
      ];

      // Add CPF search if search has digits
      if (normalizedSearch.length > 0) {
        searchConditions.push({
          documents: {
            some: {
              value: { contains: normalizedSearch },
            },
          },
        });
      }

      where.OR = searchConditions;
    }

    // Build orderBy clause
    const orderBy: Prisma.PatientOrderByWithRelationInput = {
      [sortBy]: sortDir,
    };

    // Execute query with pagination
    const [patients, total] = await Promise.all([
      this.prisma.client.patient.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
        include: this.documentsInclude,
      }),
      this.prisma.client.patient.count({ where }),
    ]);

    return {
      patients: patients.map((patient) => this.mapToEntity(patient)),
      total,
    };
  }

  /** @inheritdoc */
  async findByPhone(clinicId: string, phone: string): Promise<Patient | null> {
    const patient = await this.prisma.client.patient.findFirst({
      where: {
        clinicId,
        phone,
        deletedAt: null,
      },
      include: this.documentsInclude,
    });

    if (!patient) {
      return null;
    }

    return this.mapToEntity(patient);
  }

  /** @inheritdoc */
  async create(data: Patient): Promise<Patient> {
    const createdPatient = await this.prisma.client.patient.create({
      data: {
        id: data.id,
        clinicId: data.clinicId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        medicalRecordId: data.medicalRecordId,
        notes: data.notes,
      },
      include: this.documentsInclude,
    });

    return this.mapToEntity(createdPatient);
  }

  /**
   * Creates or updates a CPF document for a patient.
   *
   * @param patientId - The patient's unique identifier
   * @param clinicId - The clinic's unique identifier
   * @param cpfValue - The CPF value (normalized, digits only) or null to remove
   */
  async upsertCpfDocument(
    patientId: string,
    clinicId: string,
    cpfValue: string | null,
  ): Promise<void> {
    // Get the CPF document type
    const cpfType = await this.prisma.client.documentType.findUnique({
      where: { code: 'CPF' },
    });

    if (!cpfType) {
      throw new Error('CPF document type not found in database');
    }

    // If cpfValue is null or empty, delete any existing CPF document
    if (!cpfValue) {
      await this.prisma.client.patientDocument.deleteMany({
        where: {
          patientId,
          documentTypeId: cpfType.id,
        },
      });
      return;
    }

    // Upsert the CPF document
    await this.prisma.client.patientDocument.upsert({
      where: {
        patientId_documentTypeId: {
          patientId,
          documentTypeId: cpfType.id,
        },
      },
      update: {
        value: cpfValue,
      },
      create: {
        clinicId,
        patientId,
        documentTypeId: cpfType.id,
        value: cpfValue,
      },
    });
  }

  /** @inheritdoc */
  async save(patient: Patient): Promise<Patient> {
    const updatedPatient = await this.prisma.client.patient.update({
      where: {
        id: patient.id,
      },
      data: {
        name: patient.name,
        phone: patient.phone,
        email: patient.email,
        dateOfBirth: patient.dateOfBirth,
        medicalRecordId: patient.medicalRecordId,
        notes: patient.notes,
      },
      include: this.documentsInclude,
    });

    return this.mapToEntity(updatedPatient);
  }

  /** @inheritdoc */
  async softDelete(id: string): Promise<void> {
    await this.prisma.client.patient.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /** @inheritdoc */
  mapToEntity(patient: PrismaPatientWithDocuments): Patient {
    return new Patient({
      id: patient.id,
      clinicId: patient.clinicId,
      name: patient.name,
      phone: patient.phone,
      email: patient.email,
      dateOfBirth: patient.dateOfBirth,
      medicalRecordId: patient.medicalRecordId,
      notes: patient.notes,
      documents: patient.documents.map((doc) => ({
        id: doc.id,
        clinicId: doc.clinicId,
        patientId: doc.patientId,
        documentTypeId: doc.documentTypeId,
        value: doc.value,
        documentType: {
          id: doc.documentType.id,
          code: doc.documentType.code,
          name: doc.documentType.name,
        },
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      deletedAt: patient.deletedAt,
    });
  }
}
