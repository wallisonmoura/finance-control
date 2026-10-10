import { InvalidIncomeGoalTargetError } from '../errors/invalid-income-goal-target.error';

export interface IncomeGoalProps {
  id: string;
  userId: string;
  // Monthly targets, fixed until changed. null = no goal for that measure.
  // Revenue = income of the month; profit = income − expenses of the month.
  revenueTarget?: number | null;
  profitTarget?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

function isValidTarget(target: number | null | undefined): boolean {
  return target === null || target === undefined || (Number.isFinite(target) && target > 0);
}

export class IncomeGoal {
  private constructor(private readonly props: IncomeGoalProps) {
    this.validate();
  }

  static create(props: IncomeGoalProps): IncomeGoal {
    return new IncomeGoal(props);
  }

  private validate(): void {
    if (!isValidTarget(this.props.revenueTarget) || !isValidTarget(this.props.profitTarget)) {
      throw new InvalidIncomeGoalTargetError();
    }
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get revenueTarget(): number | null {
    return this.props.revenueTarget ?? null;
  }

  get profitTarget(): number | null {
    return this.props.profitTarget ?? null;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  withTargets(targets: {
    revenueTarget: number | null;
    profitTarget: number | null;
  }): IncomeGoal {
    return IncomeGoal.create({
      ...this.props,
      ...targets,
      updatedAt: new Date(),
    });
  }
}
