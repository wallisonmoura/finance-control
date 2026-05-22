import { useCallback, useState } from 'react';

import { getExpenseCategories } from '../services/finance-api.service';
import { ExpenseCategoryUi } from '../types/finance-ui.types';

type UseExpenseCategoriesParams = {
  initialCategories?: ExpenseCategoryUi[];
  initialError?: string | null;
};

export function useExpenseCategories({
  initialCategories = [],
  initialError = null,
}: UseExpenseCategoriesParams = {}) {
  const [categories, setCategories] =
    useState<ExpenseCategoryUi[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await getExpenseCategories();

    if (response.error) {
      setError(response.error);
      setCategories([]);
      setIsLoading(false);
      return;
    }

    setCategories(response.data ?? []);
    setIsLoading(false);
  }, []);

  return {
    categories,
    isLoading,
    error,
    refresh: loadCategories,
  };
}
