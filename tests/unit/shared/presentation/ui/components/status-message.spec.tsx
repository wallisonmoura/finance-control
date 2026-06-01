import { render, screen } from '@testing-library/react';

import { StatusMessage } from '@/shared/presentation/ui/components/status-message';

describe('StatusMessage', () => {
  it('deve renderizar mensagens comuns como status', () => {
    render(<StatusMessage message='Dados atualizados.' />);

    expect(screen.getByRole('status')).toHaveTextContent('Dados atualizados.');
  });

  it('deve renderizar mensagens de sucesso como status', () => {
    render(<StatusMessage message='Registro salvo.' tone='success' />);

    expect(screen.getByRole('status')).toHaveTextContent('Registro salvo.');
  });

  it('deve renderizar mensagens de erro como alerta', () => {
    render(<StatusMessage message='Falha ao carregar.' tone='error' />);

    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao carregar.');
  });
});
