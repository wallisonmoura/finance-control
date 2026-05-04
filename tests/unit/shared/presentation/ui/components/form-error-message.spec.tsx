import { render, screen } from '@testing-library/react';

import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';

describe('FormErrorMessage', () => {
  it('deve renderizar mensagem quando existir erro', () => {
    render(<FormErrorMessage message='Erro ao autenticar.' />);

    expect(screen.getByRole('alert')).toHaveTextContent('Erro ao autenticar.');
  });

  it('não deve renderizar nada quando mensagem for null', () => {
    render(<FormErrorMessage message={null} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
