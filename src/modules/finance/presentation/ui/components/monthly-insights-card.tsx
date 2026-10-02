import { HandCoins, Lightbulb, ReceiptText } from 'lucide-react';
import Link from 'next/link';

import { Card } from '@/shared/presentation/ui/components/card';
import { StatusMessage } from '@/shared/presentation/ui/components/status-message';
import { cn } from '@/shared/presentation/ui/lib/utils';

import { MonthlyInsightsUi, MonthlyInsightUi } from '../types/finance-ui.types';
import {
  formatInsight,
  getInsightSentiment,
  getMonthName,
  InsightContext,
  InsightEmphasis,
  InsightSentiment,
} from '../utils/format-insight';

type MonthlyInsightsCardProps = {
  insights?: MonthlyInsightsUi | null;
  error?: string | null;
};

const SENTIMENT_DOT_CLASS_NAME: Record<InsightSentiment, string> = {
  positive: 'bg-income',
  negative: 'bg-expense',
  neutral: 'bg-muted-foreground',
};

const EMPHASIS_CLASS_NAME: Record<InsightEmphasis, string> = {
  strong: 'font-semibold text-foreground',
  income: 'font-semibold text-income',
  expense: 'font-semibold text-expense',
};

function InsightItem({ insight, context }: { insight: MonthlyInsightUi; context: InsightContext }) {
  return (
    <li className='flex gap-3'>
      <span
        aria-hidden='true'
        data-slot='insight-dot'
        className={cn(
          'mt-1.5 size-2 shrink-0 rounded-full',
          SENTIMENT_DOT_CLASS_NAME[getInsightSentiment(insight)],
        )}
      />
      <p className='text-sm text-muted-foreground'>
        {formatInsight(insight, context).map((segment, index) =>
          segment.emphasis ? (
            <span key={index} className={EMPHASIS_CLASS_NAME[segment.emphasis]}>
              {segment.text}
            </span>
          ) : (
            segment.text
          ),
        )}
      </p>
    </li>
  );
}

type InsightColumnProps = {
  title: string;
  icon: typeof ReceiptText;
  items: MonthlyInsightUi[];
  emptyText: string;
  context: InsightContext;
  className?: string;
};

function InsightColumn({
  title,
  icon: Icon,
  items,
  emptyText,
  context,
  className,
}: InsightColumnProps) {
  return (
    <div className={cn('space-y-4 p-5', className)}>
      <div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
        <Icon aria-hidden='true' className='size-4 text-muted-foreground' />
        <h3>{title}</h3>
      </div>

      {items.length === 0 ? (
        <p className='text-sm text-muted-foreground'>{emptyText}</p>
      ) : (
        <ul className='space-y-3'>
          {items.map((insight) => (
            <InsightItem key={insight.kind} insight={insight} context={context} />
          ))}
        </ul>
      )}
    </div>
  );
}

function MonthlyInsightsContent({ insights, error }: MonthlyInsightsCardProps) {
  if (error) {
    return <StatusMessage tone='error' message={error} />;
  }

  if (!insights) {
    return null;
  }

  if (!insights.hasEntries) {
    return (
      <Card className='p-5'>
        <p className='text-sm text-muted-foreground'>
          Nenhum lançamento registrado neste mês ainda.
        </p>
      </Card>
    );
  }

  const context: InsightContext = {
    referenceMonth: insights.referenceMonth,
    comparisonMonth: insights.comparisonMonth,
    isClosedMonth: insights.isClosedMonth,
  };

  return (
    <Card className='p-0'>
      <div className='grid lg:grid-cols-2'>
        <InsightColumn
          title='Gastos'
          icon={ReceiptText}
          items={insights.expenseInsights}
          emptyText='Nenhuma despesa neste mês ainda.'
          context={context}
        />
        <InsightColumn
          title='Ganhos'
          icon={HandCoins}
          items={insights.incomeInsights}
          emptyText='Nenhuma receita neste mês ainda.'
          context={context}
          className='border-t border-border lg:border-t-0 lg:border-l'
        />
      </div>
    </Card>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getTitle(insights?: MonthlyInsightsUi | null): { title: string; subtitle?: string } {
  if (!insights?.isClosedMonth) {
    return { title: 'Insights do mês' };
  }

  // The closed month is always the one right before the current month.
  const currentMonth = { year: 0, month: (insights.referenceMonth.month % 12) + 1 };

  return {
    title: `Insights de ${getMonthName(insights.referenceMonth)}`,
    subtitle: `${capitalize(getMonthName(currentMonth))} ainda não tem lançamentos.`,
  };
}

export function MonthlyInsightsCard(props: MonthlyInsightsCardProps) {
  const { title, subtitle } = getTitle(props.insights);

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between gap-3'>
        <div className='min-w-0'>
          <div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
            <Lightbulb aria-hidden='true' className='size-4 text-muted-foreground' />
            <h2>{title}</h2>
          </div>
          {subtitle ? <p className='mt-1 text-xs text-muted-foreground'>{subtitle}</p> : null}
        </div>

        <Link
          href='/relatorios'
          className='shrink-0 text-xs font-semibold text-muted-foreground hover:text-foreground'
        >
          Ver relatórios
        </Link>
      </div>

      <MonthlyInsightsContent {...props} />
    </div>
  );
}
