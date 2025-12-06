import type { WithOptional } from '@/shared/core/default.entity';
import { randomUUID } from 'crypto';

export class User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(
    data: WithOptional<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ) {
    Object.assign(this, {
      ...data,
      id: data.id ? data.id : randomUUID(),
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }
}
