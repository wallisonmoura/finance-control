'use client';

import { SelectField } from '@/shared/presentation/ui/components/select-field';

import {
  REPORTS_PERIOD_MONTH_OPTIONS,
  ReportsPeriodMonths,
} from '../utils/reports-period';

type ReportsPeriodSelectProps = {
  id: string;
  value: ReportsPeriodMonths;
  onChange: (months: ReportsPeriodMonths) => void;
};

// Shared by the reports overview and the category history page.
export function ReportsPeriodSelect({ id, value, onChange }: ReportsPeriodSelectProps) {
  return (
    <div className='w-full max-w-48'>
      <SelectField
        id={id}
        name='months'
        label='Período'
        value={String(value)}
        onChange={(event) => onChange(Number(event.target.value) as ReportsPeriodMonths)}
        // Unlike Tipo/Categoria elsewhere, Período never has a legitimate
        // empty state — it always defaults to 6 and must stay one of 3/6/12.
        // Passing `children` opts out of SelectField's default placeholder
        // option (which would otherwise be selectable and send an invalid
        // `months=0` to every chart's request). `options` stays required by
        // the component's props but is unused whenever `children` is set.
        options={[]}
      >
        {REPORTS_PERIOD_MONTH_OPTIONS.map((option) => (
          <option key={option} value={String(option)}>
            {option} meses
          </option>
        ))}
      </SelectField>
    </div>
  );
}
