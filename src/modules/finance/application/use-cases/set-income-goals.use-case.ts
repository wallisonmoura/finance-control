import { randomUUID } from 'node:crypto';

import { IncomeGoal } from '../../domain/entities/income-goal.entity';
import { IncomeGoalRepository } from '../../domain/repositories/income-goal.repository';
import { IncomeGoalTargetsOutput } from '../dtos/income-goals.output';
import { SetIncomeGoalsInput } from '../dtos/set-income-goals.input';

export class SetIncomeGoalsUseCase {
  constructor(private readonly incomeGoalRepository: IncomeGoalRepository) {}

  // Always acts on the authenticated user's own row (there is no id in the
  // request), so one user can never change another user's goals.
  async execute(input: SetIncomeGoalsInput): Promise<IncomeGoalTargetsOutput> {
    const targets = {
      revenueTarget: input.revenueTarget,
      profitTarget: input.profitTarget,
    };
    const existing = await this.incomeGoalRepository.findByUserId(input.userId);
    const goal =
      existing?.withTargets(targets) ??
      IncomeGoal.create({
        id: randomUUID(),
        userId: input.userId,
        ...targets,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const saved = await this.incomeGoalRepository.save(goal);

    return {
      revenueTarget: saved.revenueTarget,
      profitTarget: saved.profitTarget,
    };
  }
}
