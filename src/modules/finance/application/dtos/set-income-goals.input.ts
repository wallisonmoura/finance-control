export interface SetIncomeGoalsInput {
  userId: string;
  // null clears that goal.
  revenueTarget: number | null;
  profitTarget: number | null;
}
