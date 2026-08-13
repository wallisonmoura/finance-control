import { render, screen } from '@testing-library/react';

import { EmptyState } from '@/shared/presentation/ui/components/empty-state';

describe('EmptyState', () => {
  it('should render title and description', () => {
    render(
      <EmptyState
        title='Nenhum registro'
        description='Cadastre um novo item para começar.'
      />,
    );

    expect(screen.getByText('Nenhum registro')).toBeInTheDocument();
    expect(
      screen.getByText('Cadastre um novo item para começar.'),
    ).toBeInTheDocument();
  });
});
