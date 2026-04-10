import { Debt } from '../entities/debt.entity';

export interface DebtRepository {
  findById(id: string): Promise<Debt | null>;
  findByUserId(userId: string): Promise<Debt[]>;
  findPendingByUserId(userId: string): Promise<Debt[]>;
  create(debt: Debt): Promise<Debt>;
  update(debt: Debt): Promise<Debt>;
  delete(id: string): Promise<void>;
}
