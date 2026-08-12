import { getPendingDebts } from '../services/debt-api.service';
import { DebtUi } from '../types/debts-ui.types';
import { useDebtListState } from './use-debt-list-state';

type UsePendingDebtsParams = {
  initialDebts?: DebtUi[];
  initialError?: string | null;
};

export function usePendingDebts(params: UsePendingDebtsParams = {}) {
  return useDebtListState({ ...params, fetchDebts: getPendingDebts });
}
