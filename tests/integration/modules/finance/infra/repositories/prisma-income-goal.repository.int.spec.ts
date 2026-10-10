import { randomUUID } from 'node:crypto';

import { IncomeGoal } from '@/modules/finance/domain/entities/income-goal.entity';
import { PrismaIncomeGoalRepository } from '@/modules/finance/infra/repositories/prisma-income-goal.repository';
import { prisma } from '@/shared/infra/database/prisma/client';

import { createTestUser } from '../../../../../helpers/database/create-test-user';

function newGoal(userId: string, revenueTarget: number | null, profitTarget: number | null) {
  return IncomeGoal.create({
    id: randomUUID(),
    userId,
    revenueTarget,
    profitTarget,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('PrismaIncomeGoalRepository', () => {
  const repository = new PrismaIncomeGoalRepository();

  beforeEach(async () => {
    await prisma.incomeGoal.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.incomeGoal.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should return null when the user has no income goal', async () => {
    const user = await createTestUser();

    await expect(repository.findByUserId(user.id)).resolves.toBeNull();
  });

  it('should create the goal and update the same row afterwards', async () => {
    const user = await createTestUser();

    const created = await repository.save(newGoal(user.id, 6000, 2000.5));
    expect(created.revenueTarget).toBe(6000);
    expect(created.profitTarget).toBe(2000.5);

    const updated = await repository.save(created.withTargets({ revenueTarget: 7000, profitTarget: null }));
    expect(updated.revenueTarget).toBe(7000);
    expect(updated.profitTarget).toBeNull();

    expect(await prisma.incomeGoal.count({ where: { userId: user.id } })).toBe(1);
    const found = await repository.findByUserId(user.id);
    expect(found?.revenueTarget).toBe(7000);
    expect(found?.profitTarget).toBeNull();
  });

  it('should keep goals isolated per user', async () => {
    const owner = await createTestUser({ email: 'owner-goal@test.com' });
    const other = await createTestUser({ email: 'other-goal@test.com' });

    await repository.save(newGoal(owner.id, 6000, null));

    await expect(repository.findByUserId(other.id)).resolves.toBeNull();
  });

  it('should reject a non-positive target at the database level', async () => {
    const user = await createTestUser();

    await expect(
      prisma.incomeGoal.create({
        data: { userId: user.id, revenueTarget: 0 },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.incomeGoal.create({
        data: { userId: user.id, profitTarget: -1 },
      }),
    ).rejects.toThrow();
  });
});
