import { SetIncomeGoalsUseCase } from '../../application/use-cases/set-income-goals.use-case';
import { PrismaIncomeGoalRepository } from '../repositories/prisma-income-goal.repository';

export function makeSetIncomeGoalsUseCase(): SetIncomeGoalsUseCase {
  return new SetIncomeGoalsUseCase(new PrismaIncomeGoalRepository());
}
