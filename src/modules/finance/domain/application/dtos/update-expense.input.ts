export interface UpdateExpenseInput {
  id: string;
  userId: string;
  amount: number;
  description: string;
  date: Date;
  categoryId: string;
  notes?: string | null;
}
