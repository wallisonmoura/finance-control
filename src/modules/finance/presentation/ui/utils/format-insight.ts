import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

import { InsightMonthUi, MonthlyInsightUi } from '../types/finance-ui.types';

// The single source of truth for whether an insight is good news (helps the
// user save or earn), bad news (weighs on the budget) or just information.
// The dot and the highlighted words both follow it.
export type InsightSentiment = 'positive' | 'negative' | 'neutral';

// How a piece of an insight sentence is highlighted: `strong` for key
// values/names, `income`/`expense` when the piece is good/bad news.
export type InsightEmphasis = 'strong' | 'income' | 'expense';

export type InsightSegment = {
  text: string;
  emphasis?: InsightEmphasis;
};

// What the sentences need to know about the period being described.
export type InsightContext = {
  referenceMonth: InsightMonthUi;
  comparisonMonth: InsightMonthUi;
  isClosedMonth: boolean;
};

const MONTH_NAMES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const UNKNOWN_CATEGORY_LABEL = 'Sem categoria';

export function getMonthName(month: InsightMonthUi): string {
  return MONTH_NAMES[month.month - 1];
}

type Phrases = {
  // "até agora" (current month) / "em setembro" (closed month)
  sofar: string;
  // "no mesmo período de agosto" / "em agosto"
  inComparison: string;
  // "ao mesmo período de agosto" / "a agosto"
  toComparison: string;
  comparisonName: string;
};

function buildPhrases(context: InsightContext): Phrases {
  const comparisonName = getMonthName(context.comparisonMonth);

  if (context.isClosedMonth) {
    return {
      sofar: `em ${getMonthName(context.referenceMonth)}`,
      inComparison: `em ${comparisonName}`,
      toComparison: `a ${comparisonName}`,
      comparisonName,
    };
  }

  return {
    sofar: 'até agora',
    inComparison: `no mesmo período de ${comparisonName}`,
    toComparison: `ao mesmo período de ${comparisonName}`,
    comparisonName,
  };
}

function plain(text: string): InsightSegment {
  return { text };
}

function highlight(text: string, emphasis: InsightEmphasis): InsightSegment {
  return { text, emphasis };
}

// Category names can be plural ("Parcelas"), so sentences keep a singular
// subject ("Gasto com …", "Sua maior despesa é …") instead of conjugating
// the verb against the category name.
function categoryLabel(categoryName: string | null): string {
  return categoryName ?? UNKNOWN_CATEGORY_LABEL;
}

function sentimentEmphasis(sentiment: InsightSentiment): InsightEmphasis {
  if (sentiment === 'positive') {
    return 'income';
  }

  return sentiment === 'negative' ? 'expense' : 'strong';
}

// "12% a mais que no mesmo período de agosto (R$ 2.840,00)": the comparison
// value is shown so the percentage has a visible base.
function describeChange(
  changePercent: number,
  previous: number,
  phrases: Phrases,
  sentiment: InsightSentiment,
): InsightSegment[] {
  const reference = [
    plain(` (`),
    highlight(formatMoney(previous), 'strong'),
    plain(')'),
  ];

  if (changePercent === 0) {
    return [plain(`o mesmo que ${phrases.inComparison}`), ...reference];
  }

  const direction = changePercent > 0 ? 'a mais' : 'a menos';

  return [
    highlight(`${Math.abs(changePercent)}% ${direction}`, sentimentEmphasis(sentiment)),
    plain(` que ${phrases.inComparison}`),
    ...reference,
  ];
}

function describeAverageWindow(monthsCount: number): string {
  return monthsCount === 1 ? 'no último mês' : `nos últimos ${monthsCount} meses`;
}

export function formatInsight(
  insight: MonthlyInsightUi,
  context: InsightContext,
): InsightSegment[] {
  const phrases = buildPhrases(context);

  switch (insight.kind) {
    case 'EXPENSE_TOTAL_COMPARISON':
      return [
        plain('Você gastou '),
        highlight(formatMoney(insight.current), 'strong'),
        plain(` ${phrases.sofar}, `),
        ...describeChange(
          insight.changePercent,
          insight.previous,
          phrases,
          getInsightSentiment(insight),
        ),
        plain('.'),
      ];
    case 'TOP_EXPENSE_CATEGORY':
      return [
        plain('Sua maior despesa é '),
        highlight(categoryLabel(insight.categoryName), 'strong'),
        plain(': '),
        highlight(formatMoney(insight.amount), 'strong'),
        plain(`, ${insight.sharePercent}% de tudo o que você gastou ${phrases.sofar}.`),
      ];
    case 'EXPENSE_CATEGORY_RISE':
      if (insight.changePercent === null) {
        return [
          highlight(categoryLabel(insight.categoryName), 'strong'),
          plain(': '),
          highlight(formatMoney(insight.current), 'expense'),
          plain(`, sem gastos ${phrases.inComparison}.`),
        ];
      }

      return [
        plain('Gasto com '),
        highlight(categoryLabel(insight.categoryName), 'strong'),
        plain(' '),
        highlight(`subiu ${insight.changePercent}%`, 'expense'),
        plain(
          ` (${formatMoney(insight.previous)} → ${formatMoney(insight.current)}) em relação ${phrases.toComparison}.`,
        ),
        ...(insight.potentialSaving === null
          ? []
          : [
              plain(` Voltando ao nível de ${phrases.comparisonName}, você economiza `),
              highlight(formatMoney(insight.potentialSaving), 'income'),
              plain('.'),
            ]),
      ];
    case 'EXPENSE_CATEGORY_DROP':
      return [
        plain('Gasto com '),
        highlight(categoryLabel(insight.categoryName), 'strong'),
        plain(' '),
        highlight(`caiu ${Math.abs(insight.changePercent)}%`, 'income'),
        plain(` (${formatMoney(insight.previous)} → ${formatMoney(insight.current)}). Boa!`),
      ];
    case 'INCOME_TOTAL_COMPARISON':
      return [
        plain('Você ganhou '),
        highlight(formatMoney(insight.current), 'strong'),
        plain(` ${phrases.sofar}, `),
        ...describeChange(
          insight.changePercent,
          insight.previous,
          phrases,
          getInsightSentiment(insight),
        ),
        plain('.'),
      ];
    case 'INCOME_VS_AVERAGE': {
      const window = describeAverageWindow(insight.monthsCount);

      if (insight.current < insight.average) {
        return [
          plain(`Sua média de ganho ${window} é `),
          highlight(formatMoney(insight.average), 'strong'),
          plain('. Faltam '),
          highlight(formatMoney(insight.average - insight.current), 'expense'),
          plain(' para alcançá-la.'),
        ];
      }

      if (insight.current === insight.average) {
        return [
          plain(`Você alcançou sua média de ganho ${window} (`),
          highlight(formatMoney(insight.average), 'strong'),
          plain(').'),
        ];
      }

      return [
        plain(`Você já passou sua média de ganho ${window} (`),
        highlight(formatMoney(insight.average), 'strong'),
        plain(') em '),
        highlight(formatMoney(insight.current - insight.average), 'income'),
        plain('.'),
      ];
    }
    case 'MONTH_RESULT': {
      const isNegative = insight.result < 0;
      const sign = isNegative ? '−' : '+';

      return [
        plain(`Receitas − despesas ${phrases.sofar}: `),
        highlight(
          `${sign} ${formatMoney(Math.abs(insight.result))}`,
          isNegative ? 'expense' : 'income',
        ),
        plain('.'),
      ];
    }
  }
}

export function insightToText(segments: InsightSegment[]): string {
  return segments.map((segment) => segment.text).join('');
}

export function getInsightSentiment(insight: MonthlyInsightUi): InsightSentiment {
  switch (insight.kind) {
    case 'EXPENSE_TOTAL_COMPARISON':
      if (insight.changePercent === 0) {
        return 'neutral';
      }

      return insight.changePercent < 0 ? 'positive' : 'negative';
    case 'INCOME_TOTAL_COMPARISON':
      if (insight.changePercent === 0) {
        return 'neutral';
      }

      return insight.changePercent > 0 ? 'positive' : 'negative';
    case 'TOP_EXPENSE_CATEGORY':
      return 'neutral';
    case 'EXPENSE_CATEGORY_RISE':
      return 'negative';
    case 'EXPENSE_CATEGORY_DROP':
      return 'positive';
    case 'INCOME_VS_AVERAGE':
      return insight.current >= insight.average ? 'positive' : 'negative';
    case 'MONTH_RESULT':
      return insight.result < 0 ? 'negative' : 'positive';
  }
}
