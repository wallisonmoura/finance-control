import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';

import { DebtsPageContent } from '@/modules/debts/presentation/ui/components/debts-page-content';
import { useDebts } from '@/modules/debts/presentation/ui/hooks/use-debts';
import { deleteDebt } from '@/modules/debts/presentation/ui/services/debt-api.service';

jest.mock('@/modules/debts/presentation/ui/hooks/use-debts');
jest.mock('@/modules/debts/presentation/ui/services/debt-api.service', () => ({
  deleteDebt: jest.fn(),
  registerDebt: jest.fn(),
  updateDebt: jest.fn(),
}));
jest.mock('next/navigation');

const useDebtsMock = jest.mocked(useDebts);
const deleteDebtMock = jest.mocked(deleteDebt);
const useRouterMock = jest.mocked(useRouter);
const useSearchParamsMock = jest.mocked(useSearchParams);

const refreshMock = jest.fn();
const push = jest.fn();

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

    useRouterMock.mockReturnValue({
      push,
    } as unknown as ReturnType<typeof useRouter>);

    useSearchParamsMock.mockReturnValue(
      new URLSearchParams({ month: '2026-05' }) as unknown as ReturnType<
        typeof useSearchParams
      >,
    );
  });

  it('should render debts page', () => {
    render(<DebtsPageContent />);

    expect(screen.getByText('Dívidas')).toBeInTheDocument();
    expect(screen.getByText('Seguro do carro')).toBeInTheDocument();
    expect(screen.getByText('Valor pendente')).toBeInTheDocument();
    expect(screen.getByText('Valor pago')).toBeInTheDocument();
    expect(screen.getByText('Valor pendente no mês')).toBeInTheDocument();
    expect(screen.getByText('Dívidas pendentes no mês')).toBeInTheDocument();
    expect(screen.getAllByText('R$ 300,00')).toHaveLength(3);
    expect(screen.getAllByText('R$ 500,00')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Ver pendentes' })).toHaveAttribute(
      'href',
      '/debts/pending',
    );
    expect(screen.getByRole('link', { name: 'Ver pagas' })).toHaveAttribute(
      'href',
      '/debts/paid',
    );
    expect(screen.getByRole('button', { name: 'Nova dívida' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
  });

  it('should open create debt form', async () => {
    const user = userEvent.setup();

    render(<DebtsPageContent />);

    await user.click(screen.getByRole('button', { name: 'Nova dívida' }));

    expect(screen.getByRole('heading', { name: 'Cadastrar dívida' })).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nova dívida' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeInTheDocument();
  });

  it('should open edit debt form', async () => {
    const user = userEvent.setup();

    render(<DebtsPageContent />);

    await user.click(screen.getByRole('button', { name: 'Editar' }));

    expect(screen.getByText('Editar dívida')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toHaveValue('Seguro do carro');
    expect(screen.getByDisplayValue('300,00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Parcela unica')).toBeInTheDocument();
    // Focus lands on the form's first focusable field, in DOM order —
    // Descrição, since the debt form fields were reordered (Descrição now
    // comes before Tipo).
    expect(screen.getByLabelText('Descrição')).toHaveFocus();
  });

  it('should delete a debt when confirmed', async () => {
    const user = userEvent.setup();

    deleteDebtMock.mockResolvedValueOnce({
      data: undefined,
    });

    render(<DebtsPageContent />);

    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    const dialog = screen.getByRole('alertdialog');

    expect(
      within(dialog).getByText('Deseja excluir a dívida "Seguro do carro"?'),
    ).toBeInTheDocument();

    await user.click(
      within(dialog).getByRole('button', { name: 'Excluir' }),
    );

    expect(deleteDebtMock).toHaveBeenCalledWith('debt-id');
    expect(refreshMock).toHaveBeenCalled();
  });

  it('should only list debts due in the selected month, keeping summary totals unfiltered', () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams({ month: '2026-06' }) as unknown as ReturnType<
        typeof useSearchParams
      >,
    );

    render(<DebtsPageContent />);

    expect(screen.queryByText('Seguro do carro')).not.toBeInTheDocument();
    expect(screen.queryByText('IPVA')).not.toBeInTheDocument();
    // Os totais do resumo continuam somando as duas dívidas (mês 2026-05),
    // mesmo com o mês filtrado (2026-06) sem nenhuma dívida.
    expect(screen.getByText('R$ 300,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 500,00')).toBeInTheDocument();
    // O mini-resumo do mês reflete o mês filtrado (sem dívidas), não o geral.
    expect(screen.getByText('R$ 0,00')).toBeInTheDocument();
  });

  it('should push the next month to the url when navigating forward', async () => {
    const user = userEvent.setup();

    render(<DebtsPageContent />);

    await user.click(screen.getByRole('button', { name: 'Próximo mês' }));

    expect(push).toHaveBeenCalledWith('/debts?month=2026-06');
  });
});
