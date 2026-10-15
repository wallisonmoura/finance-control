import { render } from '@testing-library/react';

import { MonthlyIncomeGoalsStripSkeleton } from '@/modules/finance/presentation/ui/components/monthly-income-goals-strip-skeleton';

describe('MonthlyIncomeGoalsStripSkeleton', () => {
  it('should mirror the strip: a title and two goal parts with a progress bar each', () => {
    const { container } = render(<MonthlyIncomeGoalsStripSkeleton />);

    expect(container.querySelectorAll('.h-2.w-full')).toHaveLength(2);
    expect(container.querySelector('.lg\\:grid-cols-\\[3fr_2fr\\]')).not.toBeNull();
  });
});
