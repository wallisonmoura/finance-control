import { render, screen } from '@testing-library/react';

import { ConfirmDialog } from '@/shared/presentation/ui/components/confirm-dialog';

describe('ConfirmDialog', () => {
  it('should render the given confirmation text', () => {
    render(
      <ConfirmDialog
        open
        title='Confirmar ação'
        description='Deseja continuar?'
        confirmLabel='Continuar'
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled();
  });

  it('should render the custom loading text', () => {
    render(
      <ConfirmDialog
        open
        title='Excluir registro'
        description='Deseja excluir este registro?'
        confirmLabel='Excluir'
        confirmingLabel='Excluindo...'
        isConfirming
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Excluindo...' })).toBeDisabled();
  });
});
