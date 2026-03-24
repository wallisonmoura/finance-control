export interface UpdateIncomeInput {
  id: string;
  userId: string;
  amount: number;
  description: string;
  date: Date;
  notes?: string | null;
}
