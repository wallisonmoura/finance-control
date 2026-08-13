import { render, screen } from '@testing-library/react';

import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';

describe('RouteLoadingRegion', () => {
  it('should expose a status role with an accessible name for screen readers', () => {
    render(
      <RouteLoadingRegion>
        <p>conteúdo interno</p>
      </RouteLoadingRegion>,
    );

    expect(screen.getByRole('status')).toHaveAccessibleName(
      'Carregando conteúdo',
    );
  });

  it('should render the given children', () => {
    render(
      <RouteLoadingRegion>
        <p>conteúdo interno</p>
      </RouteLoadingRegion>,
    );

    expect(screen.getByText('conteúdo interno')).toBeInTheDocument();
  });
});
