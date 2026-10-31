import {
  describeCategoryExpensesChart,
  describeDebtsPaidChart,
  describeIncomeExpenseChart,
} from '@/modules/reports/presentation/ui/utils/reports-overview-description';
import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

describe('describeIncomeExpenseChart', () => {
  it('should state the period, the totals and the result', () => {
    expect(
      describeIncomeExpenseChart([
        { monthLabel: 'set/26', totalIncome: 3000, totalExpense: 2000 },
        { monthLabel: 'out/26', totalIncome: 1000, totalExpense: 1500 },
      ]),
    ).toBe(
      `Gráfico de barras de receita e despesa por mês, de set/26 a out/26. Receita no período: ${formatMoney(4000)}. Despesa no período: ${formatMoney(3500)}. Resultado: ${formatMoney(500)}.`,
    );
  });
});

describe('describeCategoryExpensesChart', () => {
  it('should state the total, how many categories and the largest one', () => {
    expect(
      describeCategoryExpensesChart([
        { categoryId: 'a', categoryName: 'Combustível', total: 900 },
        { categoryId: 'b', categoryName: 'Pet', total: 100 },
      ]),
    ).toBe(
      `Gráfico de barras dos gastos por categoria no período: ${formatMoney(1000)} em 2 categorias. Maior gasto: Combustível, ${formatMoney(900)}.`,
    );
  });

  it('should use the singular for a single category', () => {
    expect(
      describeCategoryExpensesChart([{ categoryId: 'a', categoryName: 'Pet', total: 50 }]),
    ).toBe(
      `Gráfico de barras dos gastos por categoria no período: ${formatMoney(50)} em 1 categoria. Maior gasto: Pet, ${formatMoney(50)}.`,
    );
  });
});

describe('describeDebtsPaidChart', () => {
  it('should state the period, the total paid and the month with the most', () => {
    expect(
      describeDebtsPaidChart([
        { monthLabel: 'set/26', total: 700 },
        { monthLabel: 'out/26', total: 1200 },
      ]),
    ).toBe(
      `Gráfico de barras do valor pago em dívidas por mês, de set/26 a out/26. Total pago no período: ${formatMoney(1900)}. Mês com mais pagamentos: out/26, ${formatMoney(1200)}.`,
    );
  });
});
