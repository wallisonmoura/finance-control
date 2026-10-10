export class InvalidIncomeGoalTargetError extends Error {
  constructor() {
    super('Meta de ganho deve ser maior que zero.');
    this.name = 'InvalidIncomeGoalTargetError';
  }
}
