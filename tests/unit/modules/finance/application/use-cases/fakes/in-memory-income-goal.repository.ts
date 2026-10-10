import { IncomeGoal } from '@/modules/finance/domain/entities/income-goal.entity';
import { IncomeGoalRepository } from '@/modules/finance/domain/repositories/income-goal.repository';

export class InMemoryIncomeGoalRepository implements IncomeGoalRepository {
  constructor(private readonly goals: IncomeGoal[] = []) {}

  async findByUserId(userId: string): Promise<IncomeGoal | null> {
    return this.goals.find((goal) => goal.userId === userId) ?? null;
  }

  async save(goal: IncomeGoal): Promise<IncomeGoal> {
    const index = this.goals.findIndex((item) => item.userId === goal.userId);

    if (index === -1) {
      this.goals.push(goal);
    } else {
      this.goals[index] = goal;
    }

    return goal;
  }
}
