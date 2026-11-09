import {
  CreatePasswordResetTokenData,
  PasswordResetTokenRepository,
} from '@/modules/auth/domain/repositories/password-reset-token.repository';

export type StoredPasswordResetToken = CreatePasswordResetTokenData & {
  createdAt: Date;
  usedAt: Date | null;
};

export class InMemoryPasswordResetTokenRepository implements PasswordResetTokenRepository {
  readonly tokens: StoredPasswordResetToken[] = [];

  // createdAt comes from the database in the real repository; here, from a clock.
  constructor(private readonly clock: () => Date = () => new Date()) {}

  async create(data: CreatePasswordResetTokenData): Promise<void> {
    this.tokens.push({ ...data, createdAt: this.clock(), usedAt: null });
  }

  async countCreatedSince(userId: string, since: Date): Promise<number> {
    return this.tokens.filter(
      (token) => token.userId === userId && token.createdAt >= since,
    ).length;
  }

  async invalidatePending(userId: string, now: Date): Promise<void> {
    for (const token of this.tokens) {
      if (token.userId === userId && token.usedAt === null) {
        token.usedAt = now;
      }
    }
  }

  async consume(tokenHash: string, now: Date): Promise<string | null> {
    const token = this.tokens.find(
      (candidate) =>
        candidate.tokenHash === tokenHash &&
        candidate.usedAt === null &&
        candidate.expiresAt > now,
    );

    if (!token) {
      return null;
    }

    token.usedAt = now;

    return token.userId;
  }
}
