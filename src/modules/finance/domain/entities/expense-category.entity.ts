import { InvalidExpenseCategoryMonthlyLimitError } from '../errors/invalid-expense-category-monthly-limit.error';
import { InvalidExpenseCategoryNameError } from '../errors/invalid-expense-category-name.error';
import { InvalidExpenseCategorySlugError } from '../errors/invalid-expense-category-slug.error';
import { InvalidExpenseCategoryUserIdError } from '../errors/invalid-expense-category-user-id.error';

export interface ExpenseCategoryProps {
  id: string;
  userId: string;
  name: string;
  slug: string;
  isActive: boolean;
  // Spending goal: fixed monthly cap for the category. null = not controlled.
  monthlyLimit?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ExpenseCategory {
  private constructor(private readonly props: ExpenseCategoryProps) {
    this.validate();
  }

  static create(props: ExpenseCategoryProps): ExpenseCategory {
    return new ExpenseCategory(props);
  }

  private validate(): void {
    if (!this.props.userId.trim()) {
      throw new InvalidExpenseCategoryUserIdError();
    }

    if (!this.props.name.trim()) {
      throw new InvalidExpenseCategoryNameError();
    }

    if (!this.props.slug.trim()) {
      throw new InvalidExpenseCategorySlugError();
    }

    const { monthlyLimit } = this.props;

    if (
      monthlyLimit !== null &&
      monthlyLimit !== undefined &&
      !(Number.isFinite(monthlyLimit) && monthlyLimit > 0)
    ) {
      throw new InvalidExpenseCategoryMonthlyLimitError();
    }
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): string {
    return this.props.slug;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get monthlyLimit(): number | null {
    return this.props.monthlyLimit ?? null;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  activate(): ExpenseCategory {
    return ExpenseCategory.create({
      ...this.props,
      isActive: true,
      updatedAt: new Date(),
    });
  }

  deactivate(): ExpenseCategory {
    return ExpenseCategory.create({
      ...this.props,
      isActive: false,
      updatedAt: new Date(),
    });
  }

  update(data: { name?: string; slug?: string }): ExpenseCategory {
    return ExpenseCategory.create({
      ...this.props,
      name: data.name ?? this.props.name,
      slug: data.slug ?? this.props.slug,
      updatedAt: new Date(),
    });
  }

  withMonthlyLimit(monthlyLimit: number | null): ExpenseCategory {
    return ExpenseCategory.create({
      ...this.props,
      monthlyLimit,
      updatedAt: new Date(),
    });
  }

  toJSON(): ExpenseCategoryProps {
    return { ...this.props };
  }
}
