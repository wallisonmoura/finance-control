import { render, screen } from '@testing-library/react';

import NotFoundPage from '@/app/not-found';

describe('NotFoundPage', () => {
  it('should show a branded not-found message', () => {
    render(<NotFoundPage />);

    expect(screen.getByText('Página não encontrada')).toBeInTheDocument();
  });

  it('should link back to the home page', () => {
    render(<NotFoundPage />);

    expect(
      screen.getByRole('link', { name: 'Voltar para o início' }),
    ).toHaveAttribute('href', '/');
  });
});
