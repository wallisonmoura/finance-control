import { act, renderHook } from '@testing-library/react';

import { useReportsPeriod } from '@/modules/reports/presentation/ui/hooks/use-reports-period';
import { ReportsPeriodMonths } from '@/modules/reports/presentation/ui/utils/reports-period';

describe('useReportsPeriod', () => {
  it('should start with the period from the URL and change it right away', () => {
    const { result } = renderHook(() => useReportsPeriod(6));

    expect(result.current[0]).toBe(6);

    act(() => result.current[1](12));

    expect(result.current[0]).toBe(12);
  });

  // Back/forward re-render the page with the URL's period; the select must
  // follow instead of keeping the value chosen before.
  it('should follow a new period from the URL after browser back or forward', () => {
    const { result, rerender } = renderHook(
      ({ months }: { months: ReportsPeriodMonths }) => useReportsPeriod(months),
      { initialProps: { months: 12 as ReportsPeriodMonths } },
    );

    rerender({ months: 3 });

    expect(result.current[0]).toBe(3);
  });
});
