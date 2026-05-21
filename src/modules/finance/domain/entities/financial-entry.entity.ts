import { FinancialEntryType } from '../enums/financial-entry-type.enum';
import { ExpenseCategoryRequiredError } from '../errors/expense-category-required.error';
import { InvalidFinancialEntryAmountError } from '../errors/invalid-financial-entry-amount.error';
import { InvalidFinancialEntryTypeError } from '../errors/invalid-financial-entry-type.error';

export interface FinancialEntryProps {
  id: string;
  userId: string;
  type: FinancialEntryType;
  amount: number;
  description: string;
  date: Date;
  categoryId?: string | null;
  debtId?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class FinancialEntry {
  private constructor(private readonly props: FinancialEntryProps) {
    this.validate();
  }

  static create(props: FinancialEntryProps): FinancialEntry {
    return new FinancialEntry({
      ...props,
      categoryId: props.categoryId ?? null,
      debtId: props.debtId ?? null,
      notes: props.notes ?? null,
    });
  }

  private validate(): void {
    if (!Object.values(FinancialEntryType).includes(this.props.type)) {
      throw new InvalidFinancialEntryTypeError();
    }

    if (this.props.amount <= 0) {
      throw new InvalidFinancialEntryAmountError();
    }

    if (!this.props.userId.trim()) {
      throw new Error('ID do usuário é obrigatório.');
    }

    if (!this.props.description.trim()) {
      throw new Error('Descrição é obrigatória.');
    }

    if (
      !(this.props.date instanceof Date) ||
      Number.isNaN(this.props.date.getTime())
    ) {
      throw new Error('Data válida é obrigatória.');
    }

    if (
      this.props.type === FinancialEntryType.EXPENSE &&
      !this.props.categoryId
    ) {
      throw new ExpenseCategoryRequiredError();
    }

    if (this.props.type === FinancialEntryType.INCOME) {
      this.props.categoryId = null;
    }
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get type(): FinancialEntryType {
    return this.props.type;
  }

  get amount(): number {
    return this.props.amount;
  }

  get description(): string {
    return this.props.description;
  }

  get date(): Date {
    return this.props.date;
  }

  get categoryId(): string | null {
    return this.props.categoryId ?? null;
  }

  get notes(): string | null {
    return this.props.notes ?? null;
  }

  get debtId(): string | null {
    return this.props.debtId ?? null;
  }

  isLinkedToDebt(): boolean {
    return Boolean(this.props.debtId);
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isIncome(): boolean {
    return this.props.type === FinancialEntryType.INCOME;
  }

  isExpense(): boolean {
    return this.props.type === FinancialEntryType.EXPENSE;
  }

  update(data: {
    amount?: number;
    description?: string;
    date?: Date;
    categoryId?: string | null;
    notes?: string | null;
  }): FinancialEntry {
    return FinancialEntry.create({
      ...this.props,
      amount: data.amount ?? this.props.amount,
      description: data.description ?? this.props.description,
      date: data.date ?? this.props.date,
      categoryId:
        this.props.type === FinancialEntryType.INCOME
          ? null
          : (data.categoryId ?? this.props.categoryId),
      notes: data.notes !== undefined ? data.notes : this.props.notes,
      updatedAt: new Date(),
    });
  }

  toJSON(): FinancialEntryProps {
    return { ...this.props };
  }
}
