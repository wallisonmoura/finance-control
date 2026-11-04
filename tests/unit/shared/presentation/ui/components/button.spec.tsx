import { render, screen } from '@testing-library/react';

import { Button } from '@/shared/presentation/ui/components/button';

describe('Button', () => {
  it('should render the given text', () => {
    render(<Button>Entrar</Button>);

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('should render disabled when disabled is given', () => {
    render(<Button disabled>Salvando</Button>);

    expect(screen.getByRole('button', { name: 'Salvando' })).toBeDisabled();
  });

  it('should keep the custom variant without ghost visual styles', () => {
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

  // The solid variant replaces a class string repeated in several forms, so it
  // must render exactly the classes those buttons had.
  it('should render the solid variant with the same classes as the old custom one', () => {
    render(
      <>
        <Button
          variant='custom'
          className='h-11 w-full bg-primary px-6 text-primary-foreground hover:bg-primary/90 sm:w-auto'
        >
          Antes
        </Button>
        <Button variant='solid' className='h-11 w-full px-6 sm:w-auto'>
          Depois
        </Button>
      </>,
    );

    const classesOf = (name: string) =>
      [...screen.getByRole('button', { name }).classList].sort();

    expect(classesOf('Depois')).toEqual(classesOf('Antes'));
  });
});
