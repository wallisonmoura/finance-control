import {
  deleteExpense,
  deleteIncome,
  getDailyProfit,
  getExpenseCategories,
  getFinanceHistory,
  getMonthlySummary,
  registerExpense,
  registerIncome,
  updateExpense,
  updateIncome,
} from '@/modules/finance/presentation/ui/services/finance-api.service';

describe('finance-api.service', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = fetchMock;
  });

  it('should register an income successfully', async () => {
    const income = {
      id: 'income-id',
      userId: 'user-id',
      type: 'INCOME',
      amount: 400,
      description: 'Corrida Nova',
      date: '2026-04-10',
      categoryId: null,
      notes: 'Pagamento PIX',
      createdAt: '2026-05-07T19:43:27.751Z',
      updatedAt: '2026-05-07T19:43:27.751Z',
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => income,
    });

    const response = await registerIncome({
      amount: 400,
      description: 'Corrida Nova',
      date: '2026-04-10',
      notes: 'Pagamento PIX',
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/finance/incomes', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 400,
        description: 'Corrida Nova',
        date: '2026-04-10',
        notes: 'Pagamento PIX',
      }),
    });

    expect(response).toEqual({
      data: income,
    });
  });

  it('should return an error when register income fails with message', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Valor deve ser maior que zero.',
      }),
    });

    const response = await registerIncome({
      amount: 0,
      description: 'Corrida Nova',
      date: '2026-04-10',
      notes: null,
    });

    expect(response).toEqual({
      error: 'Valor deve ser maior que zero.',
    });
  });

  it('should return a default error when register income fails with invalid json', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const response = await registerIncome({
      amount: 100,
      description: 'Corrida Nova',
      date: '2026-04-10',
      notes: null,
    });

    expect(response).toEqual({
      error: 'Não foi possível concluir a operação.',
    });
  });

  it('should register an expense successfully', async () => {
    const expense = {
      id: 'expense-id',
      userId: 'user-id',
      type: 'EXPENSE',
      amount: 120,
      description: 'Combustivel',
      date: '2026-05-16',
      categoryId: 'category-id',
      notes: null,
      createdAt: '2026-05-16T00:00:00.000Z',
      updatedAt: '2026-05-16T00:00:00.000Z',
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => expense,
    });

    const response = await registerExpense({
      amount: 120,
      description: 'Combustivel',
      date: '2026-05-16',
      categoryId: 'category-id',
      notes: null,
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/finance/expenses', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 120,
        description: 'Combustivel',
        date: '2026-05-16',
        categoryId: 'category-id',
        notes: null,
      }),
    });

    expect(response).toEqual({
      data: expense,
    });
  });

  it('should get finance history successfully', async () => {
    const history = {
      entries: [
        {
          id: 'income-id',
          userId: 'user-id',
          type: 'INCOME',
          amount: 400,
          description: 'ganho uber',
          date: '2026-05-05T00:00:00.000Z',
          categoryId: null,
          notes: 'UBER',
          createdAt: '2026-05-07T20:12:15.498Z',
          updatedAt: '2026-05-07T20:12:15.498Z',
        },
      ],
      totalIncome: 400,
      totalExpense: 0,
      balance: 400,
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => history,
    });

    const response = await getFinanceHistory({
      startDate: '2026-05-01',
      endDate: '2026-05-07',
      type: 'INCOME',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/finance/history?startDate=2026-05-01&endDate=2026-05-07&type=INCOME',
      {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    expect(response).toEqual({
      data: history,
    });
  });

  it('should get finance history without type filter', async () => {
    const history = {
      entries: [],
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => history,
    });

    await getFinanceHistory({
      startDate: '2026-05-01',
      endDate: '2026-05-31',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/finance/history?startDate=2026-05-01&endDate=2026-05-31',
      expect.any(Object),
    );
  });

  it('should return an error when get finance history fails with error field', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Invalid date range.',
      }),
    });

    const response = await getFinanceHistory({
      startDate: 'invalid',
      endDate: '2026-05-31',
    });

    expect(response).toEqual({
      error: 'Invalid date range.',
    });
  });

  it('should get expense categories successfully', async () => {
    const categories = [
      {
        id: 'category-id',
        name: 'Combustivel',
        slug: 'combustivel',
      },
    ];

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => categories,
    });

    const response = await getExpenseCategories();

    expect(fetchMock).toHaveBeenCalledWith('/api/finance/expense-categories', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    });

    expect(response).toEqual({
      data: categories,
    });
  });

  it('should get daily profit successfully', async () => {
    const dailyProfit = {
      date: '2026-05-17T00:00:00.000Z',
      totalIncome: 300,
      totalExpense: 120,
      profit: 180,
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => dailyProfit,
    });

    const response = await getDailyProfit('2026-05-17');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/finance/daily-profit?date=2026-05-17',
      {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    expect(response).toEqual({
      data: dailyProfit,
    });
  });

  it('should get monthly summary successfully', async () => {
    const monthlySummary = {
      year: 2026,
      month: 5,
      totalIncome: 1000,
      totalExpense: 400,
      result: 600,
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => monthlySummary,
    });

    const response = await getMonthlySummary({
      year: 2026,
      month: 5,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/finance/monthly-summary?year=2026&month=5',
      {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    expect(response).toEqual({
      data: monthlySummary,
    });
  });

  it('should return an error when get expense categories fails', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Unauthorized.',
      }),
    });

    const response = await getExpenseCategories();

    expect(response).toEqual({
      error: 'Unauthorized.',
    });
  });

  it('should update an income successfully', async () => {
    const income = {
      id: 'income-id',
      userId: 'user-id',
      type: 'INCOME',
      amount: 450,
      description: 'Corrida Atualizada',
      date: '2026-04-11',
      categoryId: null,
      notes: 'Pagamento atualizado',
      createdAt: '2026-05-07T19:43:27.751Z',
      updatedAt: '2026-05-07T20:43:27.751Z',
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => income,
    });

    const response = await updateIncome('income-id', {
      amount: 450,
      description: 'Corrida Atualizada',
      date: '2026-04-11',
      notes: 'Pagamento atualizado',
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/finance/incomes/income-id', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        amount: 450,
        description: 'Corrida Atualizada',
        date: '2026-04-11',
        notes: 'Pagamento atualizado',
      }),
    });

    expect(response).toEqual({
      data: income,
    });
  });

  it('should update an expense successfully', async () => {
    const expense = {
      id: 'expense-id',
      userId: 'user-id',
      type: 'EXPENSE',
      amount: 140,
      description: 'Combustivel atualizado',
      date: '2026-05-16',
      categoryId: 'category-id',
      notes: null,
      createdAt: '2026-05-16T00:00:00.000Z',
      updatedAt: '2026-05-16T00:00:00.000Z',
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => expense,
    });

    const response = await updateExpense('expense-id', {
      amount: 140,
      description: 'Combustivel atualizado',
      date: '2026-05-16',
      categoryId: 'category-id',
      notes: null,
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/finance/expenses/expense-id', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        amount: 140,
        description: 'Combustivel atualizado',
        date: '2026-05-16',
        categoryId: 'category-id',
        notes: null,
      }),
    });

    expect(response).toEqual({
      data: expense,
    });
  });

  it('should return an error when update income fails with message', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Income not found.',
      }),
    });

    const response = await updateIncome('income-id', {
      amount: 450,
      description: 'Corrida Atualizada',
      date: '2026-04-11',
      notes: null,
    });

    expect(response).toEqual({
      error: 'Income not found.',
    });
  });

  it('should return an error when update income fails with error field', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Invalid income data.',
      }),
    });

    const response = await updateIncome('income-id', {
      amount: 450,
      description: 'Corrida Atualizada',
      date: '2026-04-11',
      notes: null,
    });

    expect(response).toEqual({
      error: 'Invalid income data.',
    });
  });

  it('should return a default error when update income fails with invalid json', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const response = await updateIncome('income-id', {
      amount: 450,
      description: 'Corrida Atualizada',
      date: '2026-04-11',
      notes: null,
    });

    expect(response).toEqual({
      error: 'Não foi possível concluir a operação.',
    });
  });

  it('should delete an income successfully', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
    });

    const response = await deleteIncome('income-id');

    expect(fetchMock).toHaveBeenCalledWith('/api/finance/incomes/income-id', {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    });

    expect(response).toEqual({
      data: undefined,
    });
  });

  it('should delete an expense successfully', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
    });

    const response = await deleteExpense('expense-id');

    expect(fetchMock).toHaveBeenCalledWith('/api/finance/expenses/expense-id', {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    });

    expect(response).toEqual({
      data: undefined,
    });
  });

  it('should return an error when delete income fails with message', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Income not found.',
      }),
    });

    const response = await deleteIncome('income-id');

    expect(response).toEqual({
      error: 'Income not found.',
    });
  });

  it('should return an error when delete income fails with error field', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Cannot delete income.',
      }),
    });

    const response = await deleteIncome('income-id');

    expect(response).toEqual({
      error: 'Cannot delete income.',
    });
  });

  it('should return a default error when delete income fails with invalid json', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const response = await deleteIncome('income-id');

    expect(response).toEqual({
      error: 'Não foi possível concluir a operação.',
    });
  });
});
