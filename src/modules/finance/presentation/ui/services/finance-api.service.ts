import {
  DailyProfitUi,
  ExpenseCategoryUi,
  FinanceApiResponse,
  FinanceEntryUi,
  FinanceHistoryFiltersUi,
  FinanceHistoryUi,
  MonthlySummaryUi,
  RegisterExpenseUiInput,
  RegisterIncomeUiInput,
  UpdateExpenseUiInput,
  UpdateIncomeUiInput,
} from '../types/finance-ui.types';
import { parseApiError } from '@/shared/presentation/ui/lib/parse-api-error';

export async function registerIncome(
  input: RegisterIncomeUiInput,
): Promise<FinanceApiResponse<FinanceEntryUi>> {
  const response = await fetch('/api/finance/incomes', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    return {
      error: await parseApiError(response),
    };
  }

  const data = (await response.json()) as FinanceEntryUi;

  return { data };
}

export async function registerExpense(
  input: RegisterExpenseUiInput,
): Promise<FinanceApiResponse<FinanceEntryUi>> {
  const response = await fetch('/api/finance/expenses', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    return {
      error: await parseApiError(response),
    };
  }

  const data = (await response.json()) as FinanceEntryUi;

  return { data };
}

export async function updateIncome(
  id: string,
  input: UpdateIncomeUiInput,
): Promise<FinanceApiResponse<FinanceEntryUi>> {
  const response = await fetch(`/api/finance/incomes/${id}`, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    return {
      error: await parseApiError(response),
    };
  }

  const data = (await response.json()) as FinanceEntryUi;

  return { data };
}

export async function updateExpense(
  id: string,
  input: UpdateExpenseUiInput,
): Promise<FinanceApiResponse<FinanceEntryUi>> {
  const response = await fetch(`/api/finance/expenses/${id}`, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    return {
      error: await parseApiError(response),
    };
  }

  const data = (await response.json()) as FinanceEntryUi;

  return { data };
}

export async function deleteIncome(
  id: string,
): Promise<FinanceApiResponse<void>> {
  const response = await fetch(`/api/finance/incomes/${id}`, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    return {
      error: await parseApiError(response),
    };
  }

  return {
    data: undefined,
  };
}

export async function deleteExpense(
  id: string,
): Promise<FinanceApiResponse<void>> {
  const response = await fetch(`/api/finance/expenses/${id}`, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    return {
      error: await parseApiError(response),
    };
  }

  return {
    data: undefined,
  };
}

// Fixo por decisão de produto: pageSize não é configurável pela UI. Mantenha
// em sincronia com o default usado em use-finance-history.ts e no
// (private)/finance/history/page.tsx.
export const FINANCE_HISTORY_PAGE_SIZE = 20;

export async function getFinanceHistory(
  filters: FinanceHistoryFiltersUi,
): Promise<FinanceApiResponse<FinanceHistoryUi>> {
  const searchParams = new URLSearchParams({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  if (filters.type) {
    searchParams.set('type', filters.type);
  }

  if (filters.categoryId) {
    searchParams.set('categoryId', filters.categoryId);
  }

  searchParams.set('page', String(filters.page));
  searchParams.set('pageSize', String(FINANCE_HISTORY_PAGE_SIZE));

  const response = await fetch(
    `/api/finance/history?${searchParams.toString()}`,
    {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    return {
      error: await parseApiError(response),
    };
  }

  const data = (await response.json()) as FinanceHistoryUi;

  return { data };
}

// Contraparte de getFinanceHistory sem paginação — sempre retorna o período
// inteiro (GET /api/finance/history/full não aceita page/pageSize). `page`
// fica de fora do tipo de propósito: essa função nunca usa esse campo.
export async function getFullFinanceHistory(
  filters: Omit<FinanceHistoryFiltersUi, 'page'>,
): Promise<FinanceApiResponse<FinanceHistoryUi>> {
  const searchParams = new URLSearchParams({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  if (filters.type) {
    searchParams.set('type', filters.type);
  }

  if (filters.categoryId) {
    searchParams.set('categoryId', filters.categoryId);
  }

  const response = await fetch(
    `/api/finance/history/full?${searchParams.toString()}`,
    {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    return {
      error: await parseApiError(response),
    };
  }

  const data = (await response.json()) as FinanceHistoryUi;

  return { data };
}

export async function getExpenseCategories(): Promise<
  FinanceApiResponse<ExpenseCategoryUi[]>
> {
  const response = await fetch('/api/finance/expense-categories', {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    return {
      error: await parseApiError(response),
    };
  }

  const data = (await response.json()) as ExpenseCategoryUi[];

  return { data };
}

export async function getDailyProfit(
  date: string,
): Promise<FinanceApiResponse<DailyProfitUi>> {
  const searchParams = new URLSearchParams({
    date,
  });

  const response = await fetch(
    `/api/finance/daily-profit?${searchParams.toString()}`,
    {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    return {
      error: await parseApiError(response),
    };
  }

  const data = (await response.json()) as DailyProfitUi;

  return { data };
}

export async function getMonthlySummary(input: {
  year: number;
  month: number;
}): Promise<FinanceApiResponse<MonthlySummaryUi>> {
  const searchParams = new URLSearchParams({
    year: String(input.year),
    month: String(input.month),
  });

  const response = await fetch(
    `/api/finance/monthly-summary?${searchParams.toString()}`,
    {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    return {
      error: await parseApiError(response),
    };
  }

  const data = (await response.json()) as MonthlySummaryUi;

  return { data };
}

export async function getMonthlySummaryRange(
  months: number,
): Promise<FinanceApiResponse<MonthlySummaryUi[]>> {
  const searchParams = new URLSearchParams({ months: String(months) });

  const response = await fetch(
    `/api/finance/monthly-summary/range?${searchParams.toString()}`,
    {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    return {
      error: await parseApiError(response),
    };
  }

  const data = (await response.json()) as MonthlySummaryUi[];

  return { data };
}
