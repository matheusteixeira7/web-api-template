import { PrismaService } from '@/infra/database/prisma.service';
import { User } from '@/modules/users/entities/user.entity';
import { UserRole } from '@/shared/types/user-role.enum';
import { Injectable } from '@nestjs/common';

/**
 * RegisterUserApplicationService - Atomic User + Clinic creation
 *
 * Why Application Service?
 * - Needs atomic transaction across 2 modules (Users + Clinics)
 * - Can't use facades inside transaction (they use global Prisma, not transactional)
 * - Centralized orchestration for this specific cross-module operation
 *
 * When NOT to use Application Service:
 * - Simple cross-module queries → use facades directly
 * - Single module operations → use facades
 * - Non-transactional operations → use facades
 *
 * This service uses raw Prisma for atomicity.
 * Trade-off: bypasses repositories but guarantees transaction consistency.
 */
@Injectable()
export class RegisterUserApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: RegisterUserInput): Promise<User> {
    // Use Prisma transaction for atomicity
    return await this.prisma.client.$transaction(async (tx) => {
      // 1. Create clinic
      const clinicRecord = await tx.clinic.create({
        data: {
          name: input.clinicName,
          timezone: 'America/Sao_Paulo',
          isSetupComplete: false,
        },
      });

      // 2. Create user linked to clinic
      const userRecord = await tx.user.create({
        data: {
          email: input.email,
          name: input.name,
          password: input.hashedPassword,
          clinicId: clinicRecord.id,
          role: UserRole.ADMIN,
          emailVerified: input.emailVerified,
        },
      });

      // 3. Map to domain entity
      return new User({
        id: userRecord.id,
        email: userRecord.email,
        name: userRecord.name,
        password: userRecord.password,
        clinicId: userRecord.clinicId,
        role: userRecord.role as UserRole,
        emailVerified: userRecord.emailVerified,
        createdAt: userRecord.createdAt,
        updatedAt: userRecord.updatedAt,
        deletedAt: userRecord.deletedAt,
      });
    });
  }
}

export interface RegisterUserInput {
  name: string;
  email: string;
  hashedPassword: string | null;
  emailVerified: boolean;
  clinicName: string;
}
