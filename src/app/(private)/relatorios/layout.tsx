import type { ReactNode } from 'react';

import { ReportsTabs } from '@/modules/reports/presentation/ui/components/reports-tabs';

// Shared by /relatorios and /relatorios/metas, so the tabs also stay visible
// while either route's loading.tsx is shown.
export default function ReportsLayout({ children }: { children: ReactNode }) {
  return (
    <div className='space-y-6'>
      <ReportsTabs />
      {children}
    </div>
  );
}
