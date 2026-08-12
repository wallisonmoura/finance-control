import { getDebts } from '../services/debt-api.service';
import { DebtUi } from '../types/debt-ui.types';
import { useDebtListState } from './use-debt-list-state';

type UseDebtsParams = {
  initialDebts?: DebtUi[];
  initialError?: string | null;
};

export function useDebts(params: UseDebtsParams = {}) {
  return useDebtListState({ ...params, fetchDebts: getDebts });
}
