import {
  DebtApiResponse,
  DebtUi,
  PayDebtUiInput,
  RegisterDebtUiInput,
  UpdateDebtUiInput,
} from '../types/debts-ui.types';
import { parseApiError } from '@/shared/presentation/ui/lib/parse-api-error';

export async function getDebts(): Promise<DebtApiResponse<DebtUi[]>> {
  const response = await fetch('/api/debts', {
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

  const data = (await response.json()) as DebtUi[];

  return { data };
}

export async function getPendingDebts(): Promise<DebtApiResponse<DebtUi[]>> {
  const response = await fetch('/api/debts/pending', {
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

  const data = (await response.json()) as DebtUi[];

  return { data };
}

export async function registerDebt(
  input: RegisterDebtUiInput,
): Promise<DebtApiResponse<DebtUi>> {
  const response = await fetch('/api/debts', {
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

  const data = (await response.json()) as DebtUi;

  return { data };
}

export async function updateDebt(
  id: string,
  input: UpdateDebtUiInput,
): Promise<DebtApiResponse<DebtUi>> {
  const response = await fetch(`/api/debts/${id}`, {
    method: 'PUT',
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

  const data = (await response.json()) as DebtUi;

  return { data };
}

export async function deleteDebt(id: string): Promise<DebtApiResponse<void>> {
  const response = await fetch(`/api/debts/${id}`, {
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

export async function payDebt(
  id: string,
  input: PayDebtUiInput,
): Promise<DebtApiResponse<DebtUi>> {
  const response = await fetch(`/api/debts/${id}/pay`, {
    method: 'PATCH',
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

  const data = (await response.json()) as DebtUi;

  return { data };
}
