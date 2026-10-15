import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  INCOME_GOALS_INVITE_DISMISSED_KEY,
  IncomeGoalsInvite,
} from '@/modules/finance/presentation/ui/components/income-goals-invite';

describe('IncomeGoalsInvite', () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => jest.restoreAllMocks());

  it('should invite to define income goals', async () => {
    render(<IncomeGoalsInvite />);

    expect(
      await screen.findByText('Defina metas de faturamento e lucro pra acompanhar o mês aqui.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Definir metas' })).toHaveAttribute(
      'href',
      '/relatorios/metas',
    );
  });

  it('should hide for good in this browser after "Agora não"', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<IncomeGoalsInvite />);

    await user.click(await screen.findByRole('button', { name: 'Agora não' }));

    expect(screen.queryByText(/Defina metas/)).not.toBeInTheDocument();
    expect(window.localStorage.getItem(INCOME_GOALS_INVITE_DISMISSED_KEY)).toBe('1');

    unmount();
    render(<IncomeGoalsInvite />);
    // Let the mount effect read the storage before asserting it stays hidden.
    await act(async () => {});
    expect(screen.queryByText(/Defina metas/)).not.toBeInTheDocument();
  });

  it('should still work when the browser blocks storage', async () => {
    const user = userEvent.setup();
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    render(<IncomeGoalsInvite />);

    await user.click(await screen.findByRole('button', { name: 'Agora não' }));

    expect(screen.queryByText(/Defina metas/)).not.toBeInTheDocument();
  });
});
