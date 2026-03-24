export interface RegisterExpenseInput {
  userId: string;
  amount: number;
  description: string;
  date: Date;
  categoryId: string;
  notes?: string | null;
}
