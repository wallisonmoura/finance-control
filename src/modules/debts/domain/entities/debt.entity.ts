import { Money } from '@/shared/domain/value-objects/money.vo';
import { DebtPaymentSource } from '../enums/debt-payment-source.enum';
import { DebtStatus } from '../enums/debt-status.enum';
import { DebtType } from '../enums/debt-type.enum';
import { DebtAlreadyPaidError } from '../errors/debt-already-paid.error';
import { DebtTypeChangeNotAllowedError } from '../errors/debt-type-change-not-allowed.error';
import { DebtNotPaidError } from '../errors/debt-not-paid.error';
import { InvalidDebtAmountError } from '../errors/invalid-debt-amount.error';
import { InvalidDebtDescriptionError } from '../errors/invalid-debt-description.error';
import { InvalidDebtDueDateError } from '../errors/invalid-debt-due-date.error';
import { InvalidDebtPaidStateError } from '../errors/invalid-debt-paid-state.error';
import { InvalidDebtPendingStateError } from '../errors/invalid-debt-pending-state.error';
import { InvalidDebtUserIdError } from '../errors/invalid-debt-user-id.error';

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
  // When the payment was registered. The undo window counts from here, not
  // from paidAt, which the user picks and can be in the past.
  paymentRecordedAt: Date | null;
  // The debt whose payment created this recurring occurrence.
  generatedFromDebtId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type DebtCreateProps = Omit<DebtProps, 'paymentRecordedAt' | 'generatedFromDebtId'> &
  Partial<Pick<DebtProps, 'paymentRecordedAt' | 'generatedFromDebtId'>>;

export const UNDO_PAYMENT_WINDOW_MS = 24 * 60 * 60 * 1000;

export class Debt {
  private constructor(private readonly props: DebtProps) {
    this.validate();
  }

  static create(props: DebtCreateProps): Debt {
    return new Debt({
      ...props,
      notes: props.notes ?? null,
      paidAt: props.paidAt ?? null,
      paymentSource: props.paymentSource ?? null,
      paymentRecordedAt: props.paymentRecordedAt ?? null,
      generatedFromDebtId: props.generatedFromDebtId ?? null,
    });
  }

  private validate(): void {
    if (!this.props.userId.trim()) {
      throw new InvalidDebtUserIdError();
    }

    if (!this.props.description.trim()) {
      throw new InvalidDebtDescriptionError();
    }

    this.validateAmount(this.props.amount);

    if (
      !(this.props.dueDate instanceof Date) ||
      Number.isNaN(this.props.dueDate.getTime())
    ) {
      throw new InvalidDebtDueDateError();
    }

    if (this.props.status === DebtStatus.PENDING) {
      if (
        this.props.paidAt !== null ||
        this.props.paymentSource !== null ||
        this.props.paymentRecordedAt !== null
      ) {
        throw new InvalidDebtPendingStateError();
      }
    }

    if (this.props.status === DebtStatus.PAID) {
      if (this.props.paidAt === null || this.props.paymentSource === null) {
        throw new InvalidDebtPaidStateError();
      }
    }
  }

  private validateAmount(value: number): void {
    let amount: Money;

    try {
      amount = Money.create(value);
    } catch {
      throw new InvalidDebtAmountError();
    }

    if (amount.getValue() <= 0) {
      throw new InvalidDebtAmountError();
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

    // Installments only exist as part of a plan created up front: one turned
    // RECURRING would generate a new occurrence on every payment, forever, and
    // a debt turned INSTALLMENT would claim a plan that does not exist.
    const type = data.type ?? this.props.type;

    if (
      type !== this.props.type &&
      (type === DebtType.INSTALLMENT || this.props.type === DebtType.INSTALLMENT)
    ) {
      throw new DebtTypeChangeNotAllowedError();
    }

    return Debt.create({
      ...this.props,
      description: data.description ?? this.props.description,
      amount: data.amount ?? this.props.amount,
      dueDate: data.dueDate ?? this.props.dueDate,
      type,
      notes: data.notes !== undefined ? data.notes : this.props.notes,
      updatedAt: new Date(),
    });
  }

  markAsPaid(input: {
    paidAt: Date;
    paymentSource: DebtPaymentSource;
    paymentRecordedAt: Date;
  }): Debt {
    if (this.isPaid()) {
      throw new DebtAlreadyPaidError();
    }

    return Debt.create({
      ...this.props,
      status: DebtStatus.PAID,
      paidAt: input.paidAt,
      paymentSource: input.paymentSource,
      paymentRecordedAt: input.paymentRecordedAt,
      updatedAt: new Date(),
    });
  }

  markAsPending(now: Date): Debt {
    if (!this.isPaid()) {
      throw new DebtNotPaidError();
    }

    return Debt.create({
      ...this.props,
      status: DebtStatus.PENDING,
      paidAt: null,
      paymentSource: null,
      paymentRecordedAt: null,
      updatedAt: now,
    });
  }

  canUndoPayment(now: Date): boolean {
    if (!this.isPaid() || this.props.paymentRecordedAt === null) {
      return false;
    }

    return (
      now.getTime() - this.props.paymentRecordedAt.getTime() <=
      UNDO_PAYMENT_WINDOW_MS
    );
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

  get paymentRecordedAt(): Date | null {
    return this.props.paymentRecordedAt;
  }

  get generatedFromDebtId(): string | null {
    return this.props.generatedFromDebtId;
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
