import { Encrypter } from '@/shared/cryptography/encrypter';
import { HashComparer } from '@/shared/cryptography/hash-comparer';
import { HashGenerator } from '@/shared/cryptography/hash-generator';
import { Global, Module } from '@nestjs/common';
import { EnvModule } from '../env/env.module';
import { EnvService } from '../env/env.service';
import { BcryptHasher } from './bcrypt-hasher';
import { JwtEncrypter } from './jwt-encrypter';

/**
 * CryptographyModule - Global module for cryptography services
 *
 * This module provides injectable cryptography services (hashing and encryption)
 * via dependency injection, replacing direct instantiation with `new`.
 *
 * Usage:
 * @Injectable()
 * export class SomeService {
 *   constructor(
 *     private readonly hashGenerator: HashGenerator,
 *     private readonly encrypter: Encrypter,
 *   ) {}
 * }
 *
 * Benefits:
 * - Centralized crypto configuration
 * - Easy to mock in tests
 * - Follows NestJS DI patterns
 * - Interface-based injection (not concrete classes)
 */
@Global()
@Module({
  imports: [EnvModule],
  providers: [
    // Hash services (bcrypt)
    BcryptHasher,
    {
      provide: HashGenerator,
      useExisting: BcryptHasher,
    },
    {
      provide: HashComparer,
      useExisting: BcryptHasher,
    },

    // Encryption services (JWT)
    {
      provide: JwtEncrypter,
      inject: [EnvService],
      useFactory: (env: EnvService) => {
        const privateKey = env.get('JWT_PRIVATE_KEY');
        return new JwtEncrypter({
          privateKey: Buffer.from(privateKey, 'base64'),
          expiresIn: '15m',
        });
      },
    },
    {
      provide: Encrypter,
      useExisting: JwtEncrypter,
    },
  ],
  exports: [HashGenerator, HashComparer, Encrypter],
})
export class CryptographyModule {}
