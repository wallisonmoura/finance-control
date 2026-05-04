import { render, screen } from '@testing-library/react';

import { Button } from '@/shared/presentation/ui/components/button';

describe('Button', () => {
  it('deve renderizar o texto informado', () => {
    render(<Button>Entrar</Button>);

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('deve renderizar desabilitado quando disabled for informado', () => {
    render(<Button disabled>Salvando</Button>);

    expect(screen.getByRole('button', { name: 'Salvando' })).toBeDisabled();
  });
});
