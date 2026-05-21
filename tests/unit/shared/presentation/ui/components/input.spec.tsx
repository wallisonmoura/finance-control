import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Input } from '@/shared/presentation/ui/components/input';

describe('Input', () => {
  it('deve renderizar input associado ao label', () => {
    render(<Input id='email' label='E-mail' />);

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
  });

  it('deve aceitar placeholder', () => {
    render(<Input id='email' label='E-mail' placeholder='Digite seu e-mail' />);

    expect(
      screen.getByPlaceholderText('Digite seu e-mail'),
    ).toBeInTheDocument();
  });

  it('deve bloquear letras quando o input for decimal', async () => {
    const user = userEvent.setup();

    render(<Input id='amount' label='Valor' inputMode='decimal' />);

    await user.type(screen.getByLabelText('Valor'), 'abc123,45.x');

    expect(screen.getByLabelText('Valor')).toHaveValue('123,45');
  });

  it('deve limitar campos decimais a duas casas após a vírgula', async () => {
    const user = userEvent.setup();

    render(<Input id='amount' label='Valor' inputMode='decimal' />);

    await user.type(screen.getByLabelText('Valor'), '123,4567');

    expect(screen.getByLabelText('Valor')).toHaveValue('123,45');
  });

  it('deve bloquear ponto em campos decimais', async () => {
    const user = userEvent.setup();

    render(<Input id='amount' label='Valor' inputMode='decimal' />);

    await user.type(screen.getByLabelText('Valor'), '100.');

    expect(screen.getByLabelText('Valor')).toHaveValue('100');
  });

  it('deve manter letras permitidas quando o input nao for decimal', async () => {
    const user = userEvent.setup();

    render(<Input id='description' label='Descricao' />);

    await user.type(screen.getByLabelText('Descricao'), 'abc123');

    expect(screen.getByLabelText('Descricao')).toHaveValue('abc123');
  });
});
