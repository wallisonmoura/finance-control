import { IncomeGoal } from '../entities/income-goal.entity';

export interface IncomeGoalRepository {
  findByUserId(userId: string): Promise<IncomeGoal | null>;
  // Upsert: one row per user.
  save(goal: IncomeGoal): Promise<IncomeGoal>;
}
