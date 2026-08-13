import { render, screen } from '@testing-library/react';

import { PageTitle } from '@/shared/presentation/ui/components/page-title';

describe('PageTitle', () => {
  it('should render the title', () => {
    render(<PageTitle title='Dashboard' />);

    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument();
  });

  it('should render the description when given', () => {
    render(<PageTitle title='Dashboard' description='Resumo financeiro.' />);

    expect(screen.getByText('Resumo financeiro.')).toBeInTheDocument();
  });
});
