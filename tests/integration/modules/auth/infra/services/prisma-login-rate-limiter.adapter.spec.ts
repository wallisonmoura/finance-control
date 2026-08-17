import { PrismaLoginRateLimiterAdapter } from '@/modules/auth/infra/services/prisma-login-rate-limiter.adapter';
import { prisma } from '@/shared/infra/database/prisma/client';

describe('PrismaLoginRateLimiterAdapter', () => {
  const ip = '203.0.113.10';

  beforeEach(async () => {
    await prisma.loginAttempt.deleteMany();
  });

  afterAll(async () => {
    await prisma.loginAttempt.deleteMany();
    await prisma.$disconnect();
  });

  function makeSut(maxAttempts = 5, windowMinutes = 15) {
    return new PrismaLoginRateLimiterAdapter(prisma, maxAttempts, windowMinutes);
  }

  it('should not be blocked when there are no attempts recorded', async () => {
    const sut = makeSut();

    expect(await sut.isBlocked(ip)).toBe(false);
  });

  it('should not be blocked below the max attempts threshold', async () => {
    const sut = makeSut(5, 15);

    for (let i = 0; i < 4; i += 1) {
      await sut.registerAttempt(ip);
    }

    expect(await sut.isBlocked(ip)).toBe(false);
  });

  it('should be blocked once the max attempts threshold is reached', async () => {
    const sut = makeSut(5, 15);

    for (let i = 0; i < 5; i += 1) {
      await sut.registerAttempt(ip);
    }

    expect(await sut.isBlocked(ip)).toBe(true);
  });

  it('should scope attempts by ip', async () => {
    const sut = makeSut(5, 15);

    for (let i = 0; i < 5; i += 1) {
      await sut.registerAttempt(ip);
    }

    expect(await sut.isBlocked('198.51.100.20')).toBe(false);
  });

  it('should not count attempts older than the window', async () => {
    const sut = makeSut(5, 15);

    const staleDate = new Date(Date.now() - 16 * 60 * 1000);

    await prisma.loginAttempt.createMany({
      data: Array.from({ length: 5 }, () => ({
        ip,
        createdAt: staleDate,
      })),
    });

    expect(await sut.isBlocked(ip)).toBe(false);
  });

  it('should prune attempts older than the window when registering a new one', async () => {
    const staleDate = new Date(Date.now() - 20 * 60 * 1000);

    await prisma.loginAttempt.createMany({
      data: Array.from({ length: 3 }, () => ({
        ip,
        createdAt: staleDate,
      })),
    });

    const sut = makeSut(5, 15);
    await sut.registerAttempt(ip);

    const remaining = await prisma.loginAttempt.findMany();

    expect(remaining).toHaveLength(1);
    expect(remaining[0].createdAt.getTime()).toBeGreaterThan(
      staleDate.getTime(),
    );
  });
});
