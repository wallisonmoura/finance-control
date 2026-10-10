import { IncomeGoal as PrismaIncomeGoal } from '@prisma/client';

import { IncomeGoal } from '../../domain/entities/income-goal.entity';

export class PrismaIncomeGoalMapper {
  static toDomain(goal: PrismaIncomeGoal): IncomeGoal {
    return IncomeGoal.create({
      id: goal.id,
      userId: goal.userId,
      revenueTarget: goal.revenueTarget === null ? null : Number(goal.revenueTarget),
      profitTarget: goal.profitTarget === null ? null : Number(goal.profitTarget),
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    });
  }
}
