import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ErrorPage from '@/app/error';

describe('ErrorPage', () => {
  it('should show a branded error message', () => {
    render(<ErrorPage error={new Error('boom')} reset={jest.fn()} />);

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
  });

  it('should show the error digest when provided', () => {
    render(
      <ErrorPage
        error={Object.assign(new Error('boom'), { digest: 'abc123' })}
        reset={jest.fn()}
      />,
    );

    expect(screen.getByText(/abc123/)).toBeInTheDocument();
  });

  it('should not show a digest when none is provided', () => {
    render(<ErrorPage error={new Error('boom')} reset={jest.fn()} />);

    expect(screen.queryByText(/Código:/)).not.toBeInTheDocument();
  });

  it('should call reset when clicking "Tentar novamente"', async () => {
    const user = userEvent.setup();
    const reset = jest.fn();

    render(<ErrorPage error={new Error('boom')} reset={reset} />);

    await user.click(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    );

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('should link back to the home page', () => {
    render(<ErrorPage error={new Error('boom')} reset={jest.fn()} />);

    expect(
      screen.getByRole('link', { name: 'Voltar para o início' }),
    ).toHaveAttribute('href', '/');
  });
});
