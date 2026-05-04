import { render, screen } from '@testing-library/react';

import { Card } from '@/shared/presentation/ui/components/card';

describe('Card', () => {
  it('deve renderizar o conteúdo informado', () => {
    render(<Card>Conteúdo do card</Card>);

    expect(screen.getByText('Conteúdo do card')).toBeInTheDocument();
  });
});
