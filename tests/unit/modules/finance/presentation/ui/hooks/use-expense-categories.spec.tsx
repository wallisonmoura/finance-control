import { act, renderHook } from '@testing-library/react';

import { useExpenseCategories } from '@/modules/finance/presentation/ui/hooks/use-expense-categories';
import { getExpenseCategories } from '@/modules/finance/presentation/ui/services/finance-api.service';

jest.mock('@/modules/finance/presentation/ui/services/finance-api.service');

const getExpenseCategoriesMock = jest.mocked(getExpenseCategories);

describe('useExpenseCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with server expense categories', () => {
    const categories = [
      {
        id: 'category-id',
        name: 'Combustivel',
        slug: 'combustivel',
      },
    ];

    const { result } = renderHook(() =>
      useExpenseCategories({
        initialCategories: categories,
      }),
    );

    expect(result.current.categories).toEqual(categories);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(getExpenseCategoriesMock).not.toHaveBeenCalled();
  });

  it('should refresh expense categories', async () => {
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

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.categories).toEqual(categories);
    expect(result.current.error).toBeNull();
  });

  it('should expose error when refresh fails', async () => {
    getExpenseCategoriesMock.mockResolvedValueOnce({
      error: 'Não foi possível carregar categorias.',
    });

    const { result } = renderHook(() => useExpenseCategories());

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBe('Não foi possível carregar categorias.');
  });
});
