import { render, screen } from '@testing-library/react';

import { LoadingState } from '@/shared/presentation/ui/components/loading-state';

describe('LoadingState', () => {
  it('should announce the loading message as a status', () => {
    render(<LoadingState message='Carregando dados...' />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando dados...',
    );
  });
});
