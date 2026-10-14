import { render } from '@testing-library/react';

import { ReportsHistoryBodySkeleton } from '@/modules/reports/presentation/ui/components/reports-history-body-skeleton';

describe('ReportsHistoryBodySkeleton', () => {
  it('should mirror the history body: a chart card and three summary items', () => {
    const { container } = render(<ReportsHistoryBodySkeleton />);

    expect(container.querySelector('.h-72')).not.toBeNull();
    expect(container.querySelectorAll('.sm\\:grid-cols-3 > *')).toHaveLength(3);
  });
});
