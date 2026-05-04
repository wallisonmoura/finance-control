import { render, screen } from '@testing-library/react';

import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';

describe('MoneyDisplay', () => {
  it('deve renderizar valor monetário formatado', () => {
    render(<MoneyDisplay value={1500} />);

    expect(screen.getByText(/1.500,00/)).toBeInTheDocument();
  });
});
