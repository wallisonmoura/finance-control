import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReportsPeriodSelect } from '@/modules/reports/presentation/ui/components/reports-period-select';

describe('ReportsPeriodSelect', () => {
  it('should offer only the 3, 6 and 12 month periods', () => {
    render(<ReportsPeriodSelect id='period' value={6} onChange={jest.fn()} />);

    expect(
      screen.getAllByRole('option').map((option) => option.textContent),
    ).toEqual(['3 meses', '6 meses', '12 meses']);
    expect(screen.getByLabelText('Período')).toHaveValue('6');
  });

  it('should report the chosen period as a number', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<ReportsPeriodSelect id='period' value={6} onChange={onChange} />);

    await user.selectOptions(screen.getByLabelText('Período'), '12');

    expect(onChange).toHaveBeenCalledWith(12);
  });
});
