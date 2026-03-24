export interface RegisterIncomeInput {
  userId: string;
  amount: number;
  description: string;
  date: Date;
  notes?: string | null;
}
