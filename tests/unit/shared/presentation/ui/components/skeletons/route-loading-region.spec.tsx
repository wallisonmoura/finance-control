import { render, screen } from '@testing-library/react';

import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';

describe('RouteLoadingRegion', () => {
  it('deve expor role de status com nome acessível para leitores de tela', () => {
    render(
      <RouteLoadingRegion>
        <p>conteúdo interno</p>
      </RouteLoadingRegion>,
    );

    expect(screen.getByRole('status')).toHaveAccessibleName(
      'Carregando conteúdo',
    );
  });

  it('deve renderizar os filhos recebidos', () => {
    render(
      <RouteLoadingRegion>
        <p>conteúdo interno</p>
      </RouteLoadingRegion>,
    );

    expect(screen.getByText('conteúdo interno')).toBeInTheDocument();
  });
});
