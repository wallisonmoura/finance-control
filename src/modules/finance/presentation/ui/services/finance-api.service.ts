import {
  FinanceApiResponse,
  FinanceEntryUi,
  FinanceHistoryFiltersUi,
  FinanceHistoryUi,
  RegisterIncomeUiInput,
  UpdateIncomeUiInput,
} from '../types/finance-ui.types';

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorResponse;

    return (
      body.message || body.error || 'Não foi possível concluir a operação.'
    );
  } catch {
    return 'Não foi possível concluir a operação.';
  }
}

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
      error: await parseErrorResponse(response),
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
      error: await parseErrorResponse(response),
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
      error: await parseErrorResponse(response),
    };
  }

  return {
    data: undefined,
  };
}

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
      error: await parseErrorResponse(response),
    };
  }

  const data = (await response.json()) as FinanceHistoryUi;

  return { data };
}
