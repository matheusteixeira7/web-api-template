import { DatabaseModule } from '@/infra/database/database.module';
import { ClinicsModule } from '@/modules/clinics/clinics.module';
import { UsersModule } from '@/modules/users/users.module';
import { Module } from '@nestjs/common';
import { RegisterUserApplicationService } from './services/register-user-application.service';

/**
 * ApplicationModule - Application layer for cross-module orchestration
 *
 * This module contains Application Services that orchestrate operations
 * across multiple domain modules, especially for transactional operations.
 *
 * Application Services are used when:
 * - Operations span multiple modules (Users + Clinics)
 * - Atomic transactions are required
 * - Complex orchestration logic is needed
 *
 * Application Services are NOT used for:
 * - Simple cross-module queries (use facades directly)
 * - Single module operations (use facades)
 * - Non-transactional operations (use facades)
 */
@Module({
  imports: [DatabaseModule, UsersModule, ClinicsModule],
  providers: [RegisterUserApplicationService],
  exports: [RegisterUserApplicationService],
})
export class ApplicationModule {}
