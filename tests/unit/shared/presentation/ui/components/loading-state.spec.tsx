import { render, screen } from '@testing-library/react';

import { LoadingState } from '@/shared/presentation/ui/components/loading-state';

describe('LoadingState', () => {
  it('deve anunciar a mensagem de carregamento como status', () => {
    render(<LoadingState message='Carregando dados...' />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando dados...',
    );
  });
});
