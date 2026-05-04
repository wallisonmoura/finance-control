import { render, screen } from '@testing-library/react';

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
});
