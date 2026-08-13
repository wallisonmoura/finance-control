import { render, screen } from '@testing-library/react';

import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';

describe('FormErrorMessage', () => {
  it('should render the message when there is an error', () => {
    render(<FormErrorMessage message='Erro ao autenticar.' />);

    expect(screen.getByRole('alert')).toHaveTextContent('Erro ao autenticar.');
  });

  it('should render nothing when the message is null', () => {
    render(<FormErrorMessage message={null} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
