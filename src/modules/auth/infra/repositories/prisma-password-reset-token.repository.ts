import { PrismaClient } from '@prisma/client';

import { prisma } from '@/shared/infra/database/prisma/client';
import { PrismaTransactionClient } from '@/shared/infra/database/prisma/prisma-transaction-client';

import {
  CreatePasswordResetTokenData,
  PasswordResetTokenRepository,
} from '../../domain/repositories/password-reset-token.repository';

type PrismaClientOrTransaction = PrismaClient | PrismaTransactionClient;

export class PrismaPasswordResetTokenRepository implements PasswordResetTokenRepository {
  constructor(private readonly client: PrismaClientOrTransaction = prisma) {}

  async create(data: CreatePasswordResetTokenData): Promise<void> {
    await this.client.passwordResetToken.create({ data });
  }

  async countCreatedSince(userId: string, since: Date): Promise<number> {
    return this.client.passwordResetToken.count({
      where: { userId, createdAt: { gte: since } },
    });
  }

  async invalidatePending(userId: string, now: Date): Promise<void> {
    await this.client.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: now },
    });
  }

  async consume(tokenHash: string, now: Date): Promise<string | null> {
    // Conditional update: only one of two simultaneous calls matches the row.
    const result = await this.client.passwordResetToken.updateMany({
      where: { tokenHash, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });

    if (result.count !== 1) {
      return null;
    }

    const token = await this.client.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { userId: true },
    });

    return token?.userId ?? null;
  }
}
