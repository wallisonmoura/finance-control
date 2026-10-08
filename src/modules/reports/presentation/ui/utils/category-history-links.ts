export function getCategoryHistoryHref(categoryId: string, months: number): string {
  return `/relatorios/categorias/${categoryId}?months=${months}`;
}

// Finance → Histórico already filters by period, type and category.
export function getCategoryLaunchesHref({
  categoryId,
  startDate,
  endDate,
}: {
  categoryId: string;
  startDate: string;
  endDate: string;
}): string {
  const params = new URLSearchParams({
    startDate,
    endDate,
    type: 'EXPENSE',
    categoryId,
  });

  return `/finance/history?${params.toString()}`;
}
