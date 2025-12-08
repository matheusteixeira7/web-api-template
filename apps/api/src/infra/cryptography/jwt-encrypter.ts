import { sign, type SignOptions } from 'jsonwebtoken';
import { Encrypter } from '@/shared/cryptography/encrypter';

export interface JwtEncrypterConfig {
  privateKey: Buffer;
  expiresIn: SignOptions['expiresIn'];
}

export class JwtEncrypter implements Encrypter {
  constructor(private readonly config: JwtEncrypterConfig) {}

  encrypt(payload: Record<string, unknown>): Promise<string> {
    return new Promise((resolve, reject) => {
      sign(
        payload,
        this.config.privateKey,
        {
          algorithm: 'RS256',
          expiresIn: this.config.expiresIn,
        },
        (err, token) => {
          if (err || !token) {
            reject(err ?? new Error('Failed to sign token'));
          } else {
            resolve(token);
          }
        },
      );
    });
  }
}
