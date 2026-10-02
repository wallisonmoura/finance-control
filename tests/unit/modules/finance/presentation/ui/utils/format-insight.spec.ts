import {
  formatInsight,
  getInsightSentiment,
  InsightSegment,
  insightToText,
} from '@/modules/finance/presentation/ui/utils/format-insight';
import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

const currentContext = {
  referenceMonth: { year: 2026, month: 9 },
  comparisonMonth: { year: 2026, month: 8 },
  isClosedMonth: false,
};

const closedContext = { ...currentContext, isClosedMonth: true };

describe('formatInsight', () => {
  it('should describe an expense total increase', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'EXPENSE_TOTAL_COMPARISON', current: 3180, previous: 2840, changePercent: 12 },
        currentContext,
      )),
    ).toBe(
      `Você gastou ${formatMoney(3180)} até agora, 12% a mais que no mesmo período de agosto (${formatMoney(2840)}).`,
    );
  });

  it('should describe an expense total decrease', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'EXPENSE_TOTAL_COMPARISON', current: 900, previous: 1000, changePercent: -10 },
        currentContext,
      )),
    ).toBe(
      `Você gastou ${formatMoney(900)} até agora, 10% a menos que no mesmo período de agosto (${formatMoney(1000)}).`,
    );
  });

  it('should describe an unchanged expense total', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'EXPENSE_TOTAL_COMPARISON', current: 100, previous: 100, changePercent: 0 },
        currentContext,
      )),
    ).toBe(
      `Você gastou ${formatMoney(100)} até agora, o mesmo que no mesmo período de agosto (${formatMoney(100)}).`,
    );
  });

  it('should describe the top expense category', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'TOP_EXPENSE_CATEGORY', categoryName: 'Alimentação', amount: 890, sharePercent: 35 },
        currentContext,
      )),
    ).toBe(`Sua maior despesa é Alimentação: ${formatMoney(890)}, 35% de tudo o que você gastou até agora.`);
  });

  it('should display an unresolved category as "Sem categoria"', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'TOP_EXPENSE_CATEGORY', categoryName: null, amount: 890, sharePercent: 35 },
        currentContext,
      )),
    ).toBe(`Sua maior despesa é Sem categoria: ${formatMoney(890)}, 35% de tudo o que você gastou até agora.`);
  });

  it('should describe a category rise', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'EXPENSE_CATEGORY_RISE', categoryName: 'Lazer', current: 280, previous: 200, changePercent: 40, potentialSaving: null },
        currentContext,
      )),
    ).toBe(
      `Gasto com Lazer subiu 40% (${formatMoney(200)} → ${formatMoney(280)}) em relação ao mesmo período de agosto.`,
    );
  });

  it('should describe a new category', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'EXPENSE_CATEGORY_RISE', categoryName: 'Pet', current: 150, previous: 0, changePercent: null, potentialSaving: null },
        currentContext,
      )),
    ).toBe(`Pet: ${formatMoney(150)}, sem gastos no mesmo período de agosto.`);
  });

  it('should keep the verb agreement right for plural category names', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'EXPENSE_CATEGORY_DROP', categoryName: 'Parcelas', current: 128.4, previous: 1201.08, changePercent: -89 },
        currentContext,
      )),
    ).toBe(`Gasto com Parcelas caiu 89% (${formatMoney(1201.08)} → ${formatMoney(128.4)}). Boa!`);
  });

  it('should describe a category drop', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'EXPENSE_CATEGORY_DROP', categoryName: 'Transporte', current: 300, previous: 400, changePercent: -25 },
        currentContext,
      )),
    ).toBe(`Gasto com Transporte caiu 25% (${formatMoney(400)} → ${formatMoney(300)}). Boa!`);
  });

  it('should describe an income decrease', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'INCOME_TOTAL_COMPARISON', current: 4200, previous: 5000, changePercent: -16 },
        currentContext,
      )),
    ).toBe(
      `Você ganhou ${formatMoney(4200)} até agora, 16% a menos que no mesmo período de agosto (${formatMoney(5000)}).`,
    );
  });

  it('should describe income below the average with the remaining amount', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'INCOME_VS_AVERAGE', current: 4200, average: 5400, monthsCount: 3, expectedSoFar: 5400, paceChangePercent: -22 },
        closedContext,
      )),
    ).toBe(
      `Sua média de ganho nos últimos 3 meses é ${formatMoney(5400)}. Faltam ${formatMoney(1200)} para alcançá-la.`,
    );
  });

  it('should describe income above the average using the singular for one month', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'INCOME_VS_AVERAGE', current: 5700, average: 5400, monthsCount: 1, expectedSoFar: 5400, paceChangePercent: 6 },
        closedContext,
      )),
    ).toBe(
      `Você já passou sua média de ganho no último mês (${formatMoney(5400)}) em ${formatMoney(300)}.`,
    );
  });

  it('should describe income exactly at the average', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'INCOME_VS_AVERAGE', current: 5400, average: 5400, monthsCount: 2, expectedSoFar: 5400, paceChangePercent: 0 },
        closedContext,
      )),
    ).toBe(`Você alcançou sua média de ganho nos últimos 2 meses (${formatMoney(5400)}).`);
  });

  it('should describe a positive month result', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'MONTH_RESULT', totalIncome: 4200, totalExpense: 3180, result: 1020 },
        currentContext,
      )),
    ).toBe(`Receitas − despesas até agora: + ${formatMoney(1020)}.`);
  });

  it('should describe a negative month result', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'MONTH_RESULT', totalIncome: 100, totalExpense: 440, result: -340 },
        currentContext,
      )),
    ).toBe(`Receitas − despesas até agora: − ${formatMoney(340)}.`);
  });

  it('should name December when the comparison month is December', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'EXPENSE_CATEGORY_RISE', categoryName: 'Pet', current: 150, previous: 0, changePercent: null, potentialSaving: null },
        { referenceMonth: { year: 2026, month: 1 }, comparisonMonth: { year: 2025, month: 12 }, isClosedMonth: false },
      )),
    ).toBe(`Pet: ${formatMoney(150)}, sem gastos no mesmo período de dezembro.`);
  });
});

describe('getInsightSentiment', () => {
  it.each([
    ['spending total down', { kind: 'EXPENSE_TOTAL_COMPARISON', current: 90, previous: 100, changePercent: -10 }, 'positive'],
    ['spending total up', { kind: 'EXPENSE_TOTAL_COMPARISON', current: 110, previous: 100, changePercent: 10 }, 'negative'],
    ['spending total unchanged', { kind: 'EXPENSE_TOTAL_COMPARISON', current: 100, previous: 100, changePercent: 0 }, 'neutral'],
    ['top category', { kind: 'TOP_EXPENSE_CATEGORY', categoryName: 'Alimentação', amount: 890, sharePercent: 35 }, 'neutral'],
    ['category rise', { kind: 'EXPENSE_CATEGORY_RISE', categoryName: 'Lazer', current: 280, previous: 200, changePercent: 40, potentialSaving: 80 }, 'negative'],
    ['new category', { kind: 'EXPENSE_CATEGORY_RISE', categoryName: 'Pet', current: 150, previous: 0, changePercent: null, potentialSaving: null }, 'negative'],
    ['category drop', { kind: 'EXPENSE_CATEGORY_DROP', categoryName: 'Transporte', current: 300, previous: 400, changePercent: -25 }, 'positive'],
    ['income total up', { kind: 'INCOME_TOTAL_COMPARISON', current: 5500, previous: 5000, changePercent: 10 }, 'positive'],
    ['income total down', { kind: 'INCOME_TOTAL_COMPARISON', current: 4317.79, previous: 5411.2, changePercent: -20 }, 'negative'],
    ['income total unchanged', { kind: 'INCOME_TOTAL_COMPARISON', current: 100, previous: 100, changePercent: 0 }, 'neutral'],
    ['income below average', { kind: 'INCOME_VS_AVERAGE', current: 4317.79, average: 4963.49, monthsCount: 3, expectedSoFar: 4963.49, paceChangePercent: -13 }, 'negative'],
    ['mid-month income on pace', { kind: 'INCOME_VS_AVERAGE', current: 2600, average: 5000, monthsCount: 3, expectedSoFar: 2500, paceChangePercent: 4 }, 'positive'],
    ['mid-month income behind pace', { kind: 'INCOME_VS_AVERAGE', current: 1500, average: 5000, monthsCount: 3, expectedSoFar: 2500, paceChangePercent: -40 }, 'negative'],
    ['income at average', { kind: 'INCOME_VS_AVERAGE', current: 5000, average: 5000, monthsCount: 3, expectedSoFar: 5000, paceChangePercent: 0 }, 'positive'],
    ['income above average', { kind: 'INCOME_VS_AVERAGE', current: 6000, average: 5000, monthsCount: 3, expectedSoFar: 5000, paceChangePercent: 20 }, 'positive'],
    ['negative month result', { kind: 'MONTH_RESULT', totalIncome: 100, totalExpense: 109.36, result: -9.36 }, 'negative'],
    ['zero month result', { kind: 'MONTH_RESULT', totalIncome: 100, totalExpense: 100, result: 0 }, 'positive'],
  ] as const)('should classify %s', (_, insight, expected) => {
    expect(getInsightSentiment(insight)).toBe(expected);
  });
});

function emphasisOf(segments: InsightSegment[], text: string) {
  return segments.find((segment) => segment.text === text)?.emphasis;
}

describe('formatInsight emphasis', () => {
  it('should highlight a spending decrease as good and the amount as strong', () => {
    const segments = formatInsight(
      { kind: 'EXPENSE_TOTAL_COMPARISON', current: 4327.15, previous: 5277, changePercent: -18 },
      currentContext,
    );

    expect(emphasisOf(segments, '18% a menos')).toBe('income');
    expect(emphasisOf(segments, formatMoney(4327.15))).toBe('strong');
  });

  it('should highlight a spending increase as bad', () => {
    const segments = formatInsight(
      { kind: 'EXPENSE_TOTAL_COMPARISON', current: 110, previous: 100, changePercent: 10 },
      currentContext,
    );

    expect(emphasisOf(segments, '10% a mais')).toBe('expense');
  });

  it('should not color an unchanged total', () => {
    const segments = formatInsight(
      { kind: 'EXPENSE_TOTAL_COMPARISON', current: 100, previous: 100, changePercent: 0 },
      currentContext,
    );

    expect(segments.some((segment) => segment.emphasis === 'income' || segment.emphasis === 'expense')).toBe(false);
  });

  it('should make the category name strong and color a category rise as bad', () => {
    const segments = formatInsight(
      { kind: 'EXPENSE_CATEGORY_RISE', categoryName: 'Lazer', current: 280, previous: 200, changePercent: 40, potentialSaving: null },
      currentContext,
    );

    expect(emphasisOf(segments, 'Lazer')).toBe('strong');
    expect(emphasisOf(segments, 'subiu 40%')).toBe('expense');
  });

  it('should color a category drop as good', () => {
    const segments = formatInsight(
      { kind: 'EXPENSE_CATEGORY_DROP', categoryName: 'Parcelas', current: 128.4, previous: 1201.08, changePercent: -89 },
      currentContext,
    );

    expect(emphasisOf(segments, 'caiu 89%')).toBe('income');
  });

  it('should color an income decrease as bad and an increase as good', () => {
    const decrease = formatInsight(
      { kind: 'INCOME_TOTAL_COMPARISON', current: 4317.79, previous: 5330, changePercent: -19 },
      currentContext,
    );
    const increase = formatInsight(
      { kind: 'INCOME_TOTAL_COMPARISON', current: 5500, previous: 5000, changePercent: 10 },
      currentContext,
    );

    expect(emphasisOf(decrease, '19% a menos')).toBe('expense');
    expect(emphasisOf(increase, '10% a mais')).toBe('income');
  });

  it('should color the amount above the income average as good', () => {
    const segments = formatInsight(
      { kind: 'INCOME_VS_AVERAGE', current: 5700, average: 5400, monthsCount: 1, expectedSoFar: 5400, paceChangePercent: 6 },
      closedContext,
    );

    expect(emphasisOf(segments, formatMoney(5400))).toBe('strong');
    expect(emphasisOf(segments, formatMoney(300))).toBe('income');
  });

  it('should color the month result by its sign', () => {
    const negative = formatInsight(
      { kind: 'MONTH_RESULT', totalIncome: 4317.79, totalExpense: 4327.15, result: -9.36 },
      currentContext,
    );
    const positive = formatInsight(
      { kind: 'MONTH_RESULT', totalIncome: 100, totalExpense: 40, result: 60 },
      currentContext,
    );

    expect(emphasisOf(negative, `− ${formatMoney(9.36)}`)).toBe('expense');
    expect(emphasisOf(positive, `+ ${formatMoney(60)}`)).toBe('income');
  });
});

describe('formatInsight savings and closed month', () => {
  it('should suggest going back to the previous level when a rise has a potential saving', () => {
    const segments = formatInsight(
      { kind: 'EXPENSE_CATEGORY_RISE', categoryName: 'Lazer', current: 280, previous: 200, changePercent: 40, potentialSaving: 80 },
      currentContext,
    );

    expect(insightToText(segments)).toBe(
      `Gasto com Lazer subiu 40% (${formatMoney(200)} → ${formatMoney(280)}) em relação ao mesmo período de agosto. Voltando ao nível de agosto, você economiza ${formatMoney(80)}.`,
    );
    expect(segments.find((segment) => segment.text === formatMoney(80))?.emphasis).toBe('income');
  });

  it('should describe a closed month without "até agora" and against the whole previous month', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'EXPENSE_TOTAL_COMPARISON', current: 4327.15, previous: 5277, changePercent: -18 },
        closedContext,
      )),
    ).toBe(`Você gastou ${formatMoney(4327.15)} em setembro, 18% a menos que em agosto (${formatMoney(5277)}).`);
    expect(
      insightToText(formatInsight(
        { kind: 'INCOME_TOTAL_COMPARISON', current: 4317.79, previous: 5330, changePercent: -19 },
        closedContext,
      )),
    ).toBe(`Você ganhou ${formatMoney(4317.79)} em setembro, 19% a menos que em agosto (${formatMoney(5330)}).`);
  });

  it('should compare a closed-month rise, new category and result against the whole month', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'EXPENSE_CATEGORY_RISE', categoryName: 'Lazer', current: 280, previous: 200, changePercent: 40, potentialSaving: 80 },
        closedContext,
      )),
    ).toBe(
      `Gasto com Lazer subiu 40% (${formatMoney(200)} → ${formatMoney(280)}) em relação a agosto. Voltando ao nível de agosto, você economiza ${formatMoney(80)}.`,
    );
    expect(
      insightToText(formatInsight(
        { kind: 'EXPENSE_CATEGORY_RISE', categoryName: 'Pet', current: 150, previous: 0, changePercent: null, potentialSaving: null },
        closedContext,
      )),
    ).toBe(`Pet: ${formatMoney(150)}, sem gastos em agosto.`);
    expect(
      insightToText(formatInsight(
        { kind: 'MONTH_RESULT', totalIncome: 100, totalExpense: 40, result: 60 },
        closedContext,
      )),
    ).toBe(`Receitas − despesas em setembro: + ${formatMoney(60)}.`);
  });
});

describe('formatInsight follows the sentiment', () => {
  it('should show the comparison value as a strong reference', () => {
    const segments = formatInsight(
      { kind: 'EXPENSE_TOTAL_COMPARISON', current: 4327.15, previous: 5317.05, changePercent: -19 },
      closedContext,
    );

    expect(emphasisOf(segments, formatMoney(5317.05))).toBe('strong');
  });

  it('should color the remaining amount to the income average as bad', () => {
    const segments = formatInsight(
      { kind: 'INCOME_VS_AVERAGE', current: 4317.79, average: 4963.49, monthsCount: 3, expectedSoFar: 4963.49, paceChangePercent: -13 },
      closedContext,
    );

    expect(emphasisOf(segments, formatMoney(645.7))).toBe('expense');
  });

  it('should describe the top category share against the closed month spending', () => {
    expect(
      insightToText(formatInsight(
        { kind: 'TOP_EXPENSE_CATEGORY', categoryName: 'Combustível', amount: 1431.6, sharePercent: 33 },
        closedContext,
      )),
    ).toBe(`Sua maior despesa é Combustível: ${formatMoney(1431.6)}, 33% de tudo o que você gastou em setembro.`);
  });
});

describe('formatInsight income pace during the month', () => {
  const behind = { kind: 'INCOME_VS_AVERAGE', current: 1500, average: 5000, monthsCount: 3, expectedSoFar: 2500, paceChangePercent: -40 } as const;

  it('should compare month-to-date income with the pace of the average', () => {
    const segments = formatInsight(behind, currentContext);

    expect(insightToText(segments)).toBe(
      `Você está 40% abaixo do ritmo da sua média de ganho nos últimos 3 meses (${formatMoney(2500)} até hoje).`,
    );
    expect(emphasisOf(segments, '40% abaixo do ritmo')).toBe('expense');
  });

  it('should celebrate income ahead of the pace', () => {
    const segments = formatInsight(
      { ...behind, current: 3000, paceChangePercent: 20 },
      currentContext,
    );

    expect(insightToText(segments)).toBe(
      `Você está 20% acima do ritmo da sua média de ganho nos últimos 3 meses (${formatMoney(2500)} até hoje).`,
    );
    expect(emphasisOf(segments, '20% acima do ritmo')).toBe('income');
  });

  it('should say when income is exactly on pace', () => {
    expect(
      insightToText(formatInsight({ ...behind, current: 2500, paceChangePercent: 0 }, currentContext)),
    ).toBe(`Você está no ritmo da sua média de ganho nos últimos 3 meses (${formatMoney(2500)} até hoje).`);
  });
});
