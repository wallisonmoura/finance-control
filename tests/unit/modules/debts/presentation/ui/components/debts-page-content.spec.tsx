import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DebtsPageContent } from '@/modules/debts/presentation/ui/components/debts-page-content';
import { useDebts } from '@/modules/debts/presentation/ui/hooks/use-debts';
import { deleteDebt } from '@/modules/debts/presentation/ui/services/debt-api.service';

jest.mock('@/modules/debts/presentation/ui/hooks/use-debts');
jest.mock('@/modules/debts/presentation/ui/services/debt-api.service', () => ({
  deleteDebt: jest.fn(),
  registerDebt: jest.fn(),
  updateDebt: jest.fn(),
}));

const useDebtsMock = jest.mocked(useDebts);
const deleteDebtMock = jest.mocked(deleteDebt);

const refreshMock = jest.fn();

const debt = {
  id: 'debt-id',
  userId: 'user-id',
  description: 'Seguro do carro',
  amount: 300,
  dueDate: '2026-05-20T00:00:00.000Z',
  type: 'ONE_TIME' as const,
  status: 'PENDING' as const,
  notes: 'Parcela unica',
  paidAt: null,
  paymentSource: null,
  createdAt: '2026-05-16T00:00:00.000Z',
  updatedAt: '2026-05-16T00:00:00.000Z',
};

const paidDebt = {
  ...debt,
  id: 'paid-debt-id',
  description: 'IPVA',
  amount: 500,
  status: 'PAID' as const,
  paidAt: '2026-05-18T00:00:00.000Z',
  paymentSource: 'BANK' as const,
};

describe('DebtsPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useDebtsMock.mockReturnValue({
      debts: [debt, paidDebt],
      isLoading: false,
      error: null,
      refresh: refreshMock,
    });
  });

  it('should render debts page', () => {
    render(<DebtsPageContent />);

    expect(screen.getByText('Dívidas')).toBeInTheDocument();
    expect(screen.getByText('Seguro do carro')).toBeInTheDocument();
    expect(screen.getByText('Valor pendente')).toBeInTheDocument();
    expect(screen.getByText('Valor pago')).toBeInTheDocument();
    expect(screen.getAllByText('R$ 300,00')).toHaveLength(2);
    expect(screen.getAllByText('R$ 500,00')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Ver pendentes' })).toHaveAttribute(
      'href',
      '/debts/pending',
    );
    expect(screen.getByRole('link', { name: 'Ver pagas' })).toHaveAttribute(
      'href',
      '/debts/paid',
    );
    expect(screen.getByRole('button', { name: 'Nova divida' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
  });

  it('should open create debt form', async () => {
    const user = userEvent.setup();

    render(<DebtsPageContent />);

    await user.click(screen.getByRole('button', { name: 'Nova divida' }));

    expect(screen.getByRole('heading', { name: 'Cadastrar dívida' })).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo')).toBeInTheDocument();
  });

  it('should open edit debt form', async () => {
    const user = userEvent.setup();

    render(<DebtsPageContent />);

    await user.click(screen.getByRole('button', { name: 'Editar' }));

    expect(screen.getByText('Editar dívida')).toBeInTheDocument();
    expect(screen.getByLabelText('Descricao')).toHaveValue('Seguro do carro');
    expect(screen.getByDisplayValue('300')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Parcela unica')).toBeInTheDocument();
  });

  it('should delete a debt when confirmed', async () => {
    const user = userEvent.setup();

    jest.spyOn(window, 'confirm').mockReturnValueOnce(true);

    deleteDebtMock.mockResolvedValueOnce({
      data: undefined,
    });

    render(<DebtsPageContent />);

    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(window.confirm).toHaveBeenCalledWith(
      'Deseja excluir a divida "Seguro do carro"?',
    );
    expect(deleteDebtMock).toHaveBeenCalledWith('debt-id');
    expect(refreshMock).toHaveBeenCalled();
  });
});
