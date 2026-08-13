import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Input } from '@/shared/presentation/ui/components/input';

describe('Input', () => {
  it('should render an input associated with the label', () => {
    render(<Input id='email' label='E-mail' />);

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
  });

  it('should accept a placeholder', () => {
    render(<Input id='email' label='E-mail' placeholder='Digite seu e-mail' />);

    expect(
      screen.getByPlaceholderText('Digite seu e-mail'),
    ).toBeInTheDocument();
  });

  it('should block letters when the input is decimal', async () => {
    const user = userEvent.setup();

    render(<Input id='amount' label='Valor' inputMode='decimal' />);

    await user.type(screen.getByLabelText('Valor'), 'abc123,45.x');

    expect(screen.getByLabelText('Valor')).toHaveValue('123,45');
  });

  it('should limit decimal fields to two digits after the comma', async () => {
    const user = userEvent.setup();

    render(<Input id='amount' label='Valor' inputMode='decimal' />);

    await user.type(screen.getByLabelText('Valor'), '123,4567');

    expect(screen.getByLabelText('Valor')).toHaveValue('123,45');
  });

  it('should block a period in decimal fields', async () => {
    const user = userEvent.setup();

    render(<Input id='amount' label='Valor' inputMode='decimal' />);

    await user.type(screen.getByLabelText('Valor'), '100.');

    expect(screen.getByLabelText('Valor')).toHaveValue('100');
  });

  it('should keep letters allowed when the input is not decimal', async () => {
    const user = userEvent.setup();

    render(<Input id='description' label='Descricao' />);

    await user.type(screen.getByLabelText('Descricao'), 'abc123');

    expect(screen.getByLabelText('Descricao')).toHaveValue('abc123');
  });
});
