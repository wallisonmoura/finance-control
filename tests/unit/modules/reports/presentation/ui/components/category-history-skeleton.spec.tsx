import { render } from '@testing-library/react';

import { CategoryHistorySkeleton } from '@/modules/reports/presentation/ui/components/category-history-skeleton';

describe('CategoryHistorySkeleton', () => {
  it('should mirror the page: back link, title and period, goal line, chart and summary', () => {
    const { container } = render(<CategoryHistorySkeleton />);

    // back (1) + title/description (2) + period label/field (2) + goal line (2)
    // + chart title/area (2) + summary (3)
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(12);
  });
});
