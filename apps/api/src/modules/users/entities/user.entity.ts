import type { WithOptional } from '@/shared/core/default.entity';
import { randomUUID } from 'crypto';

export type UserRole = 'USER' | 'ADMIN';

export class User {
  id: string;
  email: string;
  clinicId: string;
  name: string;
  password: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(
    data: WithOptional<
      User,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'role' | 'emailVerified'
    >,
  ) {
    Object.assign(this, {
      ...data,
      id: data.id ? data.id : randomUUID(),
      role: data.role || 'USER',
      emailVerified: data.emailVerified || false,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }
}
