import { render, screen, within } from '@testing-library/react';

import { MonthlyIncomeGoalsStrip } from '@/modules/finance/presentation/ui/components/monthly-income-goals-strip';
import {
  IncomeGoalProgressUi,
  IncomeGoalsOverviewUi,
} from '@/modules/finance/presentation/ui/types/finance-ui.types';

// formatMoney uses a non-breaking space after R$; compare with plain spaces.
const plain = (value?: string | null) => value?.replace(/ /g, ' ');

const profitBehind: IncomeGoalProgressUi = {
  target: 300,
  achieved: 128.97,
  expectedSoFar: 135.48,
  remaining: 171.03,
  daysLeft: 18,
  perDay: 9.5,
  progressPercent: 43,
  exceededBy: 0,
  status: 'BEHIND',
};

const revenueOnPace: IncomeGoalProgressUi = {
  target: 4500,
  achieved: 2122.45,
  expectedSoFar: 2032.26,
  remaining: 2377.55,
  daysLeft: 18,
  perDay: 132.09,
  progressPercent: 47,
  exceededBy: 0,
  status: 'ON_PACE',
};

function overview(
  profit: IncomeGoalProgressUi | null,
  revenue: IncomeGoalProgressUi | null = null,
): IncomeGoalsOverviewUi {
  return { revenue, profit, averages: { revenue: null, profit: null } };
}

describe('MonthlyIncomeGoalsStrip', () => {
  it('should show profit first and revenue beside it, each with its status in words', () => {
    render(<MonthlyIncomeGoalsStrip overview={overview(profitBehind, revenueOnPace)} />);

    expect(screen.getByRole('heading', { name: 'Metas de ganho do mês' })).toBeInTheDocument();
    const [profit, revenue] = screen.getAllByRole('progressbar');
    expect(profit).toHaveAccessibleName('Lucro');
    expect(revenue).toHaveAccessibleName('Faturamento');

    const profitPart = screen.getByRole('group', { name: 'Lucro' });
    expect(within(profitPart).getByText('Abaixo do ritmo')).toBeInTheDocument();
    expect(plain(within(profitPart).getByText(/de R\$/).textContent)).toBe(
      'R$ 128,97 de R$ 300,00 (43%)',
    );
    // The status is beside the title, so the detail does not repeat it.
    expect(plain(within(profitPart).getByText(/^Faltam/).textContent)).toBe(
      'Faltam R$ 171,03 pra meta.',
    );
    expect(plain(within(profitPart).getByText(/^Cerca de/).textContent)).toBe(
      'Cerca de R$ 9,50 por dia.',
    );
    expect(within(profitPart).getByRole('link', { name: /Ver lucro/ })).toHaveAttribute(
      'href',
      '/relatorios/metas/lucro',
    );

    const revenuePart = screen.getByRole('group', { name: 'Faturamento' });
    expect(within(revenuePart).getByText('No ritmo')).toBeInTheDocument();
    expect(within(revenuePart).getByRole('link', { name: /Ver faturamento/ })).toHaveAttribute(
      'href',
      '/relatorios/metas/faturamento',
    );
  });

  it('should give profit the bigger value, to stand out', () => {
    render(<MonthlyIncomeGoalsStrip overview={overview(profitBehind, revenueOnPace)} />);

    const profitValue = within(screen.getByRole('group', { name: 'Lucro' })).getByText(/de R\$/);
    const revenueValue = within(screen.getByRole('group', { name: 'Faturamento' })).getByText(
      /de R\$/,
    );
    expect(profitValue).toHaveClass('text-xl');
    expect(revenueValue).not.toHaveClass('text-xl');
  });

  it('should expose each progress as an accessible progress bar', () => {
    render(<MonthlyIncomeGoalsStrip overview={overview(profitBehind)} />);

    const bar = screen.getByRole('progressbar', { name: 'Lucro' });
    expect(bar).toHaveAttribute('aria-valuenow', '43');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(plain(bar.getAttribute('aria-valuetext'))).toBe(
      'R$ 128,97 de R$ 300,00 (43%). Abaixo do ritmo. Faltam R$ 171,03 pra meta. Cerca de R$ 9,50 por dia.',
    );
  });

  it('should show only the goals that are set', () => {
    render(<MonthlyIncomeGoalsStrip overview={overview(null, revenueOnPace)} />);

    expect(screen.getAllByRole('progressbar')).toHaveLength(1);
    expect(screen.getByRole('progressbar', { name: 'Faturamento' })).toBeInTheDocument();
  });

  it('should fill the bar and tell how much can still be spent when profit is above the goal', () => {
    render(
      <MonthlyIncomeGoalsStrip
        overview={overview({
          ...profitBehind,
          achieved: 350,
          remaining: 0,
          progressPercent: 117,
          exceededBy: 50,
          status: 'REACHED',
        })}
      />,
    );

    expect(screen.getByText('Acima da meta')).toBeInTheDocument();
    expect(plain(screen.getByText(/^Você ainda pode gastar/).textContent)).toBe(
      'Você ainda pode gastar R$ 50,00 até o fim do mês e guardar R$ 300,00.',
    );
    expect(screen.queryByText(/por dia/)).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('should say a reached revenue goal is reached', () => {
    render(
      <MonthlyIncomeGoalsStrip
        overview={overview(null, {
          ...revenueOnPace,
          achieved: 5000,
          remaining: 0,
          progressPercent: 111,
          exceededBy: 500,
          status: 'REACHED',
        })}
      />,
    );

    expect(screen.getByText('Meta batida')).toBeInTheDocument();
    expect(plain(screen.getByText(/^Meta batida!/).textContent)).toBe('Meta batida! R$ 500,00 acima.');
  });

  it('should show a negative profit without a negative percent', () => {
    render(
      <MonthlyIncomeGoalsStrip
        overview={overview({ ...profitBehind, achieved: -300, progressPercent: 0 })}
      />,
    );

    expect(plain(screen.getByText(/^Lucro até agora/).textContent)).toBe(
      'Lucro até agora: -R$ 300,00',
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('should not judge the pace before day 7', () => {
    render(<MonthlyIncomeGoalsStrip overview={overview({ ...profitBehind, status: 'EARLY' })} />);

    expect(screen.getByText('Início do mês')).toBeInTheDocument();
  });

  it('should leave a dismissable invite when there are no goals', async () => {
    render(<MonthlyIncomeGoalsStrip overview={overview(null)} />);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Agora não' })).toBeInTheDocument();
  });

  it('should render nothing when the goals failed to load', () => {
    const { container } = render(
      <MonthlyIncomeGoalsStrip overview={null} error='Não foi possível carregar as metas de ganho.' />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
