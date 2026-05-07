import { BalanceSummaryUi } from '../types/balance-summary-ui.types';

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

export type BalanceSummaryApiResponse<T> = {
  data?: T;
  error?: string;
};

const BALANCE_SUMMARY_ENDPOINT = '/api/balance/summary';

async function parseApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorResponse;

    return (
      body.message ||
      body.error ||
      'Não foi possível carregar o resumo financeiro.'
    );
  } catch {
    return 'Não foi possível carregar o resumo financeiro.';
  }
}

export async function getBalanceSummary(): Promise<
  BalanceSummaryApiResponse<BalanceSummaryUi>
> {
  const response = await fetch(BALANCE_SUMMARY_ENDPOINT, {
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

  const data = (await response.json()) as BalanceSummaryUi;

  return {
    data,
  };
}
