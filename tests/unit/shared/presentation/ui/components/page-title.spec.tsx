import { render, screen } from '@testing-library/react';

import { PageTitle } from '@/shared/presentation/ui/components/page-title';

describe('PageTitle', () => {
  it('deve renderizar título', () => {
    render(<PageTitle title='Dashboard' />);

    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument();
  });

  it('deve renderizar descrição quando informada', () => {
    render(<PageTitle title='Dashboard' description='Resumo financeiro.' />);

    expect(screen.getByText('Resumo financeiro.')).toBeInTheDocument();
  });
});
