import { render, screen } from '@testing-library/react';

import { StatusMessage } from '@/shared/presentation/ui/components/status-message';

describe('StatusMessage', () => {
  it('should render common messages as a status', () => {
    render(<StatusMessage message='Dados atualizados.' />);

    expect(screen.getByRole('status')).toHaveTextContent('Dados atualizados.');
  });

  it('should render success messages as a status', () => {
    render(<StatusMessage message='Registro salvo.' tone='success' />);

    expect(screen.getByRole('status')).toHaveTextContent('Registro salvo.');
  });

  it('should use a fixed dark text color for success messages so they stay legible on the always-light-green background in dark mode', () => {
    render(<StatusMessage message='Registro salvo.' tone='success' />);

    expect(screen.getByRole('status')).toHaveClass(
      'text-success-light-foreground',
    );
    expect(screen.getByRole('status')).not.toHaveClass('text-foreground');
  });

  it('should render error messages as an alert', () => {
    render(<StatusMessage message='Falha ao carregar.' tone='error' />);

    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao carregar.');
  });
});
