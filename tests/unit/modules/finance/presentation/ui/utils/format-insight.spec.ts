import {
  formatInsight,
  getInsightTone,
} from '@/modules/finance/presentation/ui/utils/format-insight';
import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

const august = { year: 2026, month: 8 };

describe('formatInsight', () => {
  it('should describe an expense total increase', () => {
    expect(
      formatInsight(
        { kind: 'EXPENSE_TOTAL_COMPARISON', current: 3180, previous: 2840, changePercent: 12 },
        august,
      ),
    ).toBe(
      `Você gastou ${formatMoney(3180)} até agora, 12% a mais que no mesmo período de agosto.`,
    );
  });

  it('should describe an expense total decrease', () => {
    expect(
      formatInsight(
        { kind: 'EXPENSE_TOTAL_COMPARISON', current: 900, previous: 1000, changePercent: -10 },
        august,
      ),
    ).toBe(
      `Você gastou ${formatMoney(900)} até agora, 10% a menos que no mesmo período de agosto.`,
    );
  });

  it('should describe an unchanged expense total', () => {
    expect(
      formatInsight(
        { kind: 'EXPENSE_TOTAL_COMPARISON', current: 100, previous: 100, changePercent: 0 },
        august,
      ),
    ).toBe(
      `Você gastou ${formatMoney(100)} até agora, o mesmo que no mesmo período de agosto.`,
    );
  });

  it('should describe the top expense category', () => {
    expect(
      formatInsight(
        { kind: 'TOP_EXPENSE_CATEGORY', categoryName: 'Alimentação', amount: 890, sharePercent: 35 },
        august,
      ),
    ).toBe(`Sua maior despesa é Alimentação: ${formatMoney(890)} (35% do total).`);
  });

  it('should display an unresolved category as "Sem categoria"', () => {
    expect(
      formatInsight(
        { kind: 'TOP_EXPENSE_CATEGORY', categoryName: null, amount: 890, sharePercent: 35 },
        august,
      ),
    ).toBe(`Sua maior despesa é Sem categoria: ${formatMoney(890)} (35% do total).`);
  });

  it('should describe a category rise', () => {
    expect(
      formatInsight(
        { kind: 'EXPENSE_CATEGORY_RISE', categoryName: 'Lazer', current: 280, previous: 200, changePercent: 40 },
        august,
      ),
    ).toBe(
      `Gasto com Lazer subiu 40% (${formatMoney(200)} → ${formatMoney(280)}) em relação ao mesmo período de agosto.`,
    );
  });

  it('should describe a new category', () => {
    expect(
      formatInsight(
        { kind: 'EXPENSE_CATEGORY_RISE', categoryName: 'Pet', current: 150, previous: 0, changePercent: null },
        august,
      ),
    ).toBe(`Pet: ${formatMoney(150)}, sem gastos no mesmo período de agosto.`);
  });

  it('should keep the verb agreement right for plural category names', () => {
    expect(
      formatInsight(
        { kind: 'EXPENSE_CATEGORY_DROP', categoryName: 'Parcelas', current: 128.4, previous: 1201.08, changePercent: -89 },
        august,
      ),
    ).toBe(`Gasto com Parcelas caiu 89% (${formatMoney(1201.08)} → ${formatMoney(128.4)}). Boa!`);
  });

  it('should describe a category drop', () => {
    expect(
      formatInsight(
        { kind: 'EXPENSE_CATEGORY_DROP', categoryName: 'Transporte', current: 300, previous: 400, changePercent: -25 },
        august,
      ),
    ).toBe(`Gasto com Transporte caiu 25% (${formatMoney(400)} → ${formatMoney(300)}). Boa!`);
  });

  it('should describe an income decrease', () => {
    expect(
      formatInsight(
        { kind: 'INCOME_TOTAL_COMPARISON', current: 4200, previous: 5000, changePercent: -16 },
        august,
      ),
    ).toBe(
      `Você ganhou ${formatMoney(4200)} até agora, 16% a menos que no mesmo período de agosto.`,
    );
  });

  it('should describe income below the average with the remaining amount', () => {
    expect(
      formatInsight(
        { kind: 'INCOME_VS_AVERAGE', current: 4200, average: 5400, monthsCount: 3 },
        august,
      ),
    ).toBe(
      `Sua média de ganho nos últimos 3 meses é ${formatMoney(5400)}. Faltam ${formatMoney(1200)} para alcançá-la.`,
    );
  });

  it('should describe income above the average using the singular for one month', () => {
    expect(
      formatInsight(
        { kind: 'INCOME_VS_AVERAGE', current: 5700, average: 5400, monthsCount: 1 },
        august,
      ),
    ).toBe(
      `Você já passou sua média de ganho no último mês (${formatMoney(5400)}) em ${formatMoney(300)}.`,
    );
  });

  it('should describe income exactly at the average', () => {
    expect(
      formatInsight(
        { kind: 'INCOME_VS_AVERAGE', current: 5400, average: 5400, monthsCount: 2 },
        august,
      ),
    ).toBe(`Você alcançou sua média de ganho nos últimos 2 meses (${formatMoney(5400)}).`);
  });

  it('should describe a positive month result', () => {
    expect(
      formatInsight(
        { kind: 'MONTH_RESULT', totalIncome: 4200, totalExpense: 3180, result: 1020 },
        august,
      ),
    ).toBe(`Receitas − despesas até agora: + ${formatMoney(1020)}.`);
  });

  it('should describe a negative month result', () => {
    expect(
      formatInsight(
        { kind: 'MONTH_RESULT', totalIncome: 100, totalExpense: 440, result: -340 },
        august,
      ),
    ).toBe(`Receitas − despesas até agora: − ${formatMoney(340)}.`);
  });

  it('should name December when the comparison month is December', () => {
    expect(
      formatInsight(
        { kind: 'EXPENSE_CATEGORY_RISE', categoryName: 'Pet', current: 150, previous: 0, changePercent: null },
        { year: 2025, month: 12 },
      ),
    ).toBe(`Pet: ${formatMoney(150)}, sem gastos no mesmo período de dezembro.`);
  });
});

describe('getInsightTone', () => {
  it('should use the expense tone for spending going up and negative results', () => {
    expect(
      getInsightTone({ kind: 'EXPENSE_CATEGORY_RISE', categoryName: 'Lazer', current: 280, previous: 200, changePercent: 40 }),
    ).toBe('expense');
    expect(
      getInsightTone({ kind: 'EXPENSE_TOTAL_COMPARISON', current: 110, previous: 100, changePercent: 10 }),
    ).toBe('expense');
    expect(
      getInsightTone({ kind: 'MONTH_RESULT', totalIncome: 0, totalExpense: 10, result: -10 }),
    ).toBe('expense');
  });

  it('should use the income tone for spending going down and non-negative results', () => {
    expect(
      getInsightTone({ kind: 'EXPENSE_CATEGORY_DROP', categoryName: 'Transporte', current: 300, previous: 400, changePercent: -25 }),
    ).toBe('income');
    expect(
      getInsightTone({ kind: 'EXPENSE_TOTAL_COMPARISON', current: 90, previous: 100, changePercent: -10 }),
    ).toBe('income');
    expect(
      getInsightTone({ kind: 'MONTH_RESULT', totalIncome: 10, totalExpense: 0, result: 10 }),
    ).toBe('income');
  });

  it('should use the neutral tone for the remaining insights', () => {
    expect(
      getInsightTone({ kind: 'TOP_EXPENSE_CATEGORY', categoryName: 'Alimentação', amount: 890, sharePercent: 35 }),
    ).toBe('neutral');
    expect(
      getInsightTone({ kind: 'INCOME_VS_AVERAGE', current: 1, average: 2, monthsCount: 1 }),
    ).toBe('neutral');
    expect(
      getInsightTone({ kind: 'EXPENSE_TOTAL_COMPARISON', current: 100, previous: 100, changePercent: 0 }),
    ).toBe('neutral');
  });
});
