import {
  deleteDebt,
  getDebts,
  getPendingDebts,
  payDebt,
  registerDebt,
  updateDebt,
} from '@/modules/debts/presentation/ui/services/debt-api.service';

describe('debt-api.service', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = fetchMock;
  });

  it('should get debts successfully', async () => {
    const debts = [
      {
        id: 'debt-id',
        userId: 'user-id',
        description: 'Seguro do carro',
        amount: 300,
        dueDate: '2026-05-20T00:00:00.000Z',
        type: 'ONE_TIME',
        status: 'PENDING',
        notes: null,
        paidAt: null,
        paymentSource: null,
        createdAt: '2026-05-16T00:00:00.000Z',
        updatedAt: '2026-05-16T00:00:00.000Z',
      },
    ];

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => debts,
    });

    const response = await getDebts();

    expect(fetchMock).toHaveBeenCalledWith('/api/debts', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    });

    expect(response).toEqual({
      data: debts,
    });
  });

  it('should register a debt successfully', async () => {
    const debt = {
      id: 'debt-id',
      userId: 'user-id',
      description: 'Seguro do carro',
      amount: 300,
      dueDate: '2026-05-20',
      type: 'ONE_TIME',
      status: 'PENDING',
      notes: 'Parcela unica',
      paidAt: null,
      paymentSource: null,
      createdAt: '2026-05-16T00:00:00.000Z',
      updatedAt: '2026-05-16T00:00:00.000Z',
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => debt,
    });

    const response = await registerDebt({
      description: 'Seguro do carro',
      amount: 300,
      dueDate: '2026-05-20',
      type: 'ONE_TIME',
      notes: 'Parcela unica',
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/debts', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'Seguro do carro',
        amount: 300,
        dueDate: '2026-05-20',
        type: 'ONE_TIME',
        notes: 'Parcela unica',
      }),
    });

    expect(response).toEqual({
      data: debt,
    });
  });

  it('should get pending debts successfully', async () => {
    const debts = [
      {
        id: 'debt-id',
        userId: 'user-id',
        description: 'Seguro do carro',
        amount: 300,
        dueDate: '2026-05-20T00:00:00.000Z',
        type: 'ONE_TIME',
        status: 'PENDING',
        notes: null,
        paidAt: null,
        paymentSource: null,
        createdAt: '2026-05-16T00:00:00.000Z',
        updatedAt: '2026-05-16T00:00:00.000Z',
      },
    ];

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => debts,
    });

    const response = await getPendingDebts();

    expect(fetchMock).toHaveBeenCalledWith('/api/debts/pending', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    });

    expect(response).toEqual({
      data: debts,
    });
  });

  it('should update a debt successfully', async () => {
    const debt = {
      id: 'debt-id',
      userId: 'user-id',
      description: 'Seguro atualizado',
      amount: 350,
      dueDate: '2026-05-21',
      type: 'ONE_TIME',
      status: 'PENDING',
      notes: null,
      paidAt: null,
      paymentSource: null,
      createdAt: '2026-05-16T00:00:00.000Z',
      updatedAt: '2026-05-16T00:00:00.000Z',
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => debt,
    });

    const response = await updateDebt('debt-id', {
      description: 'Seguro atualizado',
      amount: 350,
      dueDate: '2026-05-21',
      type: 'ONE_TIME',
      notes: null,
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/debts/debt-id', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'Seguro atualizado',
        amount: 350,
        dueDate: '2026-05-21',
        type: 'ONE_TIME',
        notes: null,
      }),
    });

    expect(response).toEqual({
      data: debt,
    });
  });

  it('should delete a debt successfully', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
    });

    const response = await deleteDebt('debt-id');

    expect(fetchMock).toHaveBeenCalledWith('/api/debts/debt-id', {
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

  it('should pay a debt successfully', async () => {
    const debt = {
      id: 'debt-id',
      userId: 'user-id',
      description: 'Seguro do carro',
      amount: 300,
      dueDate: '2026-05-20',
      type: 'ONE_TIME',
      status: 'PAID',
      notes: null,
      paidAt: '2026-05-20',
      paymentSource: 'BANK',
      createdAt: '2026-05-16T00:00:00.000Z',
      updatedAt: '2026-05-20T00:00:00.000Z',
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => debt,
    });

    const response = await payDebt('debt-id', {
      paidAt: '2026-05-20',
      expenseCategoryId: 'category-id',
      paymentSource: 'BANK',
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/debts/debt-id/pay', {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paidAt: '2026-05-20',
        expenseCategoryId: 'category-id',
        paymentSource: 'BANK',
      }),
    });

    expect(response).toEqual({
      data: debt,
    });
  });

  it('should return an error when request fails with message', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Dívida não encontrada.',
      }),
    });

    const response = await deleteDebt('debt-id');

    expect(response).toEqual({
      error: 'Dívida não encontrada.',
    });
  });
});
