import { renderHook, waitFor } from '@testing-library/react';

import { useExpenseCategories } from '@/modules/finance/presentation/ui/hooks/use-expense-categories';
import { getExpenseCategories } from '@/modules/finance/presentation/ui/services/finance-api.service';

jest.mock('@/modules/finance/presentation/ui/services/finance-api.service');

const getExpenseCategoriesMock = jest.mocked(getExpenseCategories);

describe('useExpenseCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load expense categories', async () => {
    const categories = [
      {
        id: 'category-id',
        name: 'Combustivel',
        slug: 'combustivel',
      },
    ];

    getExpenseCategoriesMock.mockResolvedValueOnce({
      data: categories,
    });

    const { result } = renderHook(() => useExpenseCategories());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toEqual(categories);
    expect(result.current.error).toBeNull();
  });

  it('should expose error when loading categories fails', async () => {
    getExpenseCategoriesMock.mockResolvedValueOnce({
      error: 'Não foi possível carregar categorias.',
    });

    const { result } = renderHook(() => useExpenseCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBe('Não foi possível carregar categorias.');
  });
});
