import { PrismaClient } from '@prisma/client';

import {
  AUTH_LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
  AUTH_LOGIN_RATE_LIMIT_WINDOW_MINUTES,
} from '../../constants/auth.constants';
import { RateLimiterPort } from '../../domain/services/rate-limiter.port';
import { prisma } from '@/shared/infra/database/prisma/client';

export class PrismaLoginRateLimiterAdapter implements RateLimiterPort {
  constructor(
    private readonly client: PrismaClient = prisma,
    private readonly maxAttempts: number = AUTH_LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
    private readonly windowMinutes: number = AUTH_LOGIN_RATE_LIMIT_WINDOW_MINUTES,
  ) {}

  async isBlocked(key: string): Promise<boolean> {
    const attempts = await this.client.loginAttempt.count({
      where: {
        ip: key,
        createdAt: {
          gte: this.windowStart(),
        },
      },
    });

    return attempts >= this.maxAttempts;
  }

  async registerFailedAttempt(key: string): Promise<void> {
    await this.client.loginAttempt.deleteMany({
      where: {
        createdAt: {
          lt: this.windowStart(),
        },
      },
    });

    await this.client.loginAttempt.create({
      data: { ip: key },
    });
  }

  private windowStart(): Date {
    return new Date(Date.now() - this.windowMinutes * 60 * 1000);
  }
}
