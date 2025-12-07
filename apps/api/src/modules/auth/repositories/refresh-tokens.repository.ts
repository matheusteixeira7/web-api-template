export interface RefreshTokenData {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export abstract class RefreshTokensRepository {
  abstract create(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshTokenData>;

  abstract findByToken(token: string): Promise<RefreshTokenData | null>;

  abstract deleteByToken(token: string): Promise<void>;

  abstract deleteAllByUserId(userId: string): Promise<void>;

  abstract deleteExpired(): Promise<void>;
}
