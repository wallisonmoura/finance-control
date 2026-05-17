'use client';

import { useCallback, useEffect, useState } from 'react';

import { getExpenseCategories } from '../services/finance-api.service';
import { ExpenseCategoryUi } from '../types/finance-ui.types';

export function useExpenseCategories() {
  const [categories, setCategories] = useState<ExpenseCategoryUi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    let isMounted = true;

    async function loadInitialCategories() {
      const response = await getExpenseCategories();

      if (!isMounted) {
        return;
      }

      if (response.error) {
        setError(response.error);
        setCategories([]);
        setIsLoading(false);
        return;
      }

      setCategories(response.data ?? []);
      setIsLoading(false);
    }

    void loadInitialCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    categories,
    isLoading,
    error,
    refresh: loadCategories,
  };
}
