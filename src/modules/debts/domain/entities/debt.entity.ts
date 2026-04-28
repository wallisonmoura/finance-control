import { DebtPaymentSource } from '../enums/debt-payment-source.enum';
import { DebtStatus } from '../enums/debt-status.enum';
import { DebtType } from '../enums/debt-type.enum';
import { DebtAlreadyPaidError } from '../errors/debt-already-paid.error';
import { InvalidDebtAmountError } from '../errors/invalid-debt-amount.error';
import { InvalidDebtDescriptionError } from '../errors/invalid-debt-description.error';
import { InvalidDebtDueDateError } from '../errors/invalid-debt-due-date.error';
import { InvalidDebtPaidStateError } from '../errors/invalid-debt-paid-state.error';
import { InvalidDebtPendingStateError } from '../errors/invalid-debt-pending-state.error';

export interface DebtProps {
  id: string;
  userId: string;
  description: string;
  amount: number;
  dueDate: Date;
  type: DebtType;
  status: DebtStatus;
  notes: string | null;
  paidAt: Date | null;
  paymentSource: DebtPaymentSource | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Debt {
  private constructor(private readonly props: DebtProps) {
    this.validate();
  }

  static create(props: DebtProps): Debt {
    return new Debt({
      ...props,
      notes: props.notes ?? null,
      paidAt: props.paidAt ?? null,
      paymentSource: props.paymentSource ?? null,
    });
  }

  private validate(): void {
    if (!this.props.userId.trim()) {
      throw new Error('User id is required.');
    }

    if (!this.props.description.trim()) {
      throw new InvalidDebtDescriptionError();
    }

    if (this.props.amount <= 0) {
      throw new InvalidDebtAmountError();
    }

    if (
      !(this.props.dueDate instanceof Date) ||
      Number.isNaN(this.props.dueDate.getTime())
    ) {
      throw new InvalidDebtDueDateError();
    }

    if (this.props.status === DebtStatus.PENDING) {
      if (this.props.paidAt !== null || this.props.paymentSource !== null) {
        throw new InvalidDebtPendingStateError();
      }
    }

    if (this.props.status === DebtStatus.PAID) {
      if (this.props.paidAt === null || this.props.paymentSource === null) {
        throw new InvalidDebtPaidStateError();
      }
    }
  }

  update(data: {
    description?: string;
    amount?: number;
    dueDate?: Date;
    type?: DebtType;
    notes?: string | null;
  }): Debt {
    if (this.isPaid()) {
      throw new DebtAlreadyPaidError();
    }

    return Debt.create({
      ...this.props,
      description: data.description ?? this.props.description,
      amount: data.amount ?? this.props.amount,
      dueDate: data.dueDate ?? this.props.dueDate,
      type: data.type ?? this.props.type,
      notes: data.notes !== undefined ? data.notes : this.props.notes,
      updatedAt: new Date(),
    });
  }

  markAsPaid(input: { paidAt: Date; paymentSource: DebtPaymentSource }): Debt {
    if (this.isPaid()) {
      throw new DebtAlreadyPaidError();
    }

    return Debt.create({
      ...this.props,
      status: DebtStatus.PAID,
      paidAt: input.paidAt,
      paymentSource: input.paymentSource,
      updatedAt: new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get description(): string {
    return this.props.description;
  }

  get amount(): number {
    return this.props.amount;
  }

  get dueDate(): Date {
    return this.props.dueDate;
  }

  get type(): DebtType {
    return this.props.type;
  }

  get status(): DebtStatus {
    return this.props.status;
  }

  get notes(): string | null {
    return this.props.notes;
  }

  get paidAt(): Date | null {
    return this.props.paidAt;
  }

  get paymentSource(): DebtPaymentSource | null {
    return this.props.paymentSource;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isPending(): boolean {
    return this.props.status === DebtStatus.PENDING;
  }

  isPaid(): boolean {
    return this.props.status === DebtStatus.PAID;
  }

  toJSON(): DebtProps {
    return {
      ...this.props,
    };
  }
}
