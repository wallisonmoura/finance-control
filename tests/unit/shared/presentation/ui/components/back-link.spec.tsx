import { render, screen } from '@testing-library/react';

import { BackLink } from '@/shared/presentation/ui/components/back-link';

describe('BackLink', () => {
  it('deve renderizar o link de retorno', () => {
    render(<BackLink href='/finance'>Voltar para financeiro</BackLink>);

    expect(
      screen.getByRole('link', { name: 'Voltar para financeiro' }),
    ).toHaveAttribute('href', '/finance');
  });
});
