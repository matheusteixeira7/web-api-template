import { ConflictException } from '@nestjs/common';

export class UserAlreadyExistsError extends ConflictException {
  constructor(identifier: string) {
    super(`User "${identifier}" already exists.`);
  }
}
