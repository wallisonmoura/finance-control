import { setCategoryMonthlyLimitSchema } from '@/modules/finance/presentation/http/schemas/set-category-monthly-limit.schema';
import { setIncomeGoalsSchema } from '@/modules/finance/presentation/http/schemas/set-income-goals.schema';

describe('goal request bodies', () => {
  it.each([
    ['category monthly limit', setCategoryMonthlyLimitSchema, { monthlyLimit: 300 }],
    ['income goals', setIncomeGoalsSchema, { revenueTarget: 5000, profitTarget: null }],
  ] as const)('should accept the %s body and refuse unknown fields', (_name, schema, body) => {
    expect(schema.safeParse(body).success).toBe(true);
    expect(schema.safeParse({ ...body, userId: 'someone-else' }).success).toBe(false);
  });
});
