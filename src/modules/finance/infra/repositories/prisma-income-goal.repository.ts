import { prisma } from '@/shared/infra/database/prisma/client';

import { IncomeGoal } from '../../domain/entities/income-goal.entity';
import { IncomeGoalRepository } from '../../domain/repositories/income-goal.repository';
import { PrismaIncomeGoalMapper } from '../mappers/prisma-income-goal.mapper';

export class PrismaIncomeGoalRepository implements IncomeGoalRepository {
  async findByUserId(userId: string): Promise<IncomeGoal | null> {
    const goal = await prisma.incomeGoal.findUnique({ where: { userId } });

    return goal ? PrismaIncomeGoalMapper.toDomain(goal) : null;
  }

  async save(goal: IncomeGoal): Promise<IncomeGoal> {
    const targets = {
      revenueTarget: goal.revenueTarget,
      profitTarget: goal.profitTarget,
    };

    const saved = await prisma.incomeGoal.upsert({
      where: { userId: goal.userId },
      create: { id: goal.id, userId: goal.userId, ...targets },
      update: targets,
    });

    return PrismaIncomeGoalMapper.toDomain(saved);
  }
}
