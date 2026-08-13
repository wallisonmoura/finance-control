import { render, screen } from '@testing-library/react';

import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';

describe('MoneyDisplay', () => {
  it('should render the formatted monetary value', () => {
    render(<MoneyDisplay value={1500} />);

    expect(screen.getByText(/1.500,00/)).toBeInTheDocument();
  });
});
