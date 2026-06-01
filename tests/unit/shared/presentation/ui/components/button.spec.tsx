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

  it('deve manter variant custom sem estilos visuais de ghost', () => {
    render(
      <Button variant='custom' className='bg-income hover:bg-income/90'>
        Salvar
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Salvar' });

    expect(button).toHaveClass('bg-income');
    expect(button).toHaveClass('hover:bg-income/90');
    expect(button).not.toHaveClass('hover:bg-muted');
  });
});
