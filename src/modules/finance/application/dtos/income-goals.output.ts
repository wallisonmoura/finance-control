export type {
  IncomeGoalProgress as IncomeGoalProgressOutput,
  IncomeGoalsOverview as IncomeGoalsOutput,
} from '../../domain/services/income-goals';

export interface IncomeGoalTargetsOutput {
  revenueTarget: number | null;
  profitTarget: number | null;
}
