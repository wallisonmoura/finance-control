import { render, screen } from '@testing-library/react';

import { ReportsTabs } from '@/modules/reports/presentation/ui/components/reports-tabs';

const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

describe('ReportsTabs', () => {
  it('should link to the overview and the goals tabs', () => {
    mockUsePathname.mockReturnValue('/relatorios');

    render(<ReportsTabs />);

    expect(screen.getByRole('link', { name: 'Visão geral' })).toHaveAttribute(
      'href',
      '/relatorios',
    );
    expect(screen.getByRole('link', { name: 'Metas' })).toHaveAttribute(
      'href',
      '/relatorios/metas',
    );
  });

  it.each([
    ['/relatorios', 'Visão geral', 'Metas'],
    ['/relatorios/metas', 'Metas', 'Visão geral'],
  ])('should mark the tab of %s as current', (pathname, current, other) => {
    mockUsePathname.mockReturnValue(pathname);

    render(<ReportsTabs />);

    expect(screen.getByRole('link', { name: current })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: other })).not.toHaveAttribute(
      'aria-current',
    );
  });
});
