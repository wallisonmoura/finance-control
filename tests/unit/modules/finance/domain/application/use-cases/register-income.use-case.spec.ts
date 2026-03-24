import { RegisterIncomeUseCase } from '@/modules/finance/domain/application/use-cases/register-income.use-case';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { InvalidFinancialEntryAmountError } from '@/modules/finance/domain/errors/invalid-financial-entry-amount.error';

describe('RegisterIncomeUseCase', () => {
  it('deve registrar uma receita com sucesso', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository();
    const useCase = new RegisterIncomeUseCase(financialEntryRepository);

    const output = await useCase.execute({
      userId: 'user-1',
      amount: 150,
      description: 'Venda do dia',
      date: new Date('2026-03-23'),
    });

    expect(output.userId).toBe('user-1');
    expect(output.type).toBe(FinancialEntryType.INCOME);
    expect(output.amount).toBe(150);
    expect(output.categoryId).toBeNull();
  });

  it('deve falhar ao registrar receita com valor inválido', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository();
    const useCase = new RegisterIncomeUseCase(financialEntryRepository);

    await expect(
      useCase.execute({
        userId: 'user-1',
        amount: 0,
        description: 'Venda inválida',
        date: new Date('2026-03-23'),
      }),
    ).rejects.toThrow(InvalidFinancialEntryAmountError);
  });
});
