export interface SetCategoryMonthlyLimitInput {
  userId: string;
  categoryId: string;
  // null removes the goal.
  monthlyLimit: number | null;
}
