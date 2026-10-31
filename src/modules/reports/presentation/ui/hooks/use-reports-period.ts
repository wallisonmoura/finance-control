import { useState } from 'react';

import { ReportsPeriodMonths } from '../utils/reports-period';

// Period of a reports page: changes right away when picked, and follows the
// URL when the page re-renders with another one (browser back/forward).
export function useReportsPeriod(
  initialMonths: ReportsPeriodMonths,
): [ReportsPeriodMonths, (months: ReportsPeriodMonths) => void] {
  const [months, setMonths] = useState(initialMonths);
  const [urlMonths, setUrlMonths] = useState(initialMonths);

  // Adjusting state while rendering, as React recommends for "reset when a
  // prop changes"; useState alone ignores the new prop after the first render.
  if (initialMonths !== urlMonths) {
    setUrlMonths(initialMonths);
    setMonths(initialMonths);
  }

  return [months, setMonths];
}
