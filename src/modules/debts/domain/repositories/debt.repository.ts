import { Debt } from '../entities/debt.entity';

export interface DebtRepository {
  findById(id: string): Promise<Debt | null>;
  findByUserId(userId: string): Promise<Debt[]>;
  findPendingByUserId(userId: string): Promise<Debt[]>;
  create(debt: Debt): Promise<Debt>;
  update(debt: Debt): Promise<Debt>;
  delete(id: string): Promise<void>;
  // Undo of a payment. Writes are conditional and scoped by userId so that two
  // concurrent undos cannot both succeed.
  findGeneratedFrom(debtId: string, userId: string): Promise<Debt | null>;
  markPaymentUndone(debt: Debt): Promise<boolean>;
  deletePendingGeneratedFrom(debtId: string, userId: string): Promise<number>;
}
