import { RegisterInstallmentDebtUseCase } from '@/modules/debts/application/use-cases/register-installment-debt.use-case';
import { InMemoryDebtRepository } from './fakes/in-memory-debt.repository';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';

describe('RegisterInstallmentDebtUseCase', () => {
  let debtRepository: InMemoryDebtRepository;
  let sut: RegisterInstallmentDebtUseCase;

  beforeEach(() => {
    debtRepository = new InMemoryDebtRepository();
    sut = new RegisterInstallmentDebtUseCase(debtRepository);
  });

  it('should create one debt per installment with the same description and RECURRING type', async () => {
    const output = await sut.execute({
      userId: 'user-1',
      description: 'Cartão Letícia',
      amount: 1000,
      dueDate: new Date(Date.UTC(2026, 7, 29)),
      installmentCount: 4,
      notes: null,
    });

    expect(output).toHaveLength(4);
    expect(debtRepository.items).toHaveLength(4);

    for (const debt of output) {
      expect(debt.userId).toBe('user-1');
      expect(debt.description).toBe('Cartão Letícia');
      expect(debt.type).toBe(DebtType.RECURRING);
      expect(debt.status).toBe(DebtStatus.PENDING);
      expect(debt.paidAt).toBeNull();
      expect(debt.paymentSource).toBeNull();
    }
  });

  it('should format notes as "Parcela NN/NN" when no user notes are provided', async () => {
    const output = await sut.execute({
      userId: 'user-1',
      description: 'Empréstimo pessoal',
      amount: 900,
      dueDate: new Date(Date.UTC(2026, 7, 29)),
      installmentCount: 3,
    });

    expect(output.map((debt) => debt.notes)).toEqual([
      'Parcela 01/03',
      'Parcela 02/03',
      'Parcela 03/03',
    ]);
  });

  it('should append the installment label after the user notes when provided', async () => {
    const output = await sut.execute({
      userId: 'user-1',
      description: 'Compra TV',
      amount: 600,
      dueDate: new Date(Date.UTC(2026, 7, 29)),
      installmentCount: 2,
      notes: 'Loja Magazine',
    });

    expect(output.map((debt) => debt.notes)).toEqual([
      'Loja Magazine — Parcela 01/02',
      'Loja Magazine — Parcela 02/02',
    ]);
  });

  it('should split the total amount according to the installment schedule', async () => {
    const output = await sut.execute({
      userId: 'user-1',
      description: 'Compra parcelada',
      amount: 1000,
      dueDate: new Date(Date.UTC(2026, 7, 29)),
      installmentCount: 3,
    });

    expect(output.map((debt) => debt.amount)).toEqual([333.33, 333.33, 333.34]);
  });

  it('should space due dates one month apart starting from the given due date', async () => {
    const output = await sut.execute({
      userId: 'user-1',
      description: 'Compra parcelada',
      amount: 400,
      dueDate: new Date(Date.UTC(2026, 7, 29)),
      installmentCount: 4,
    });

    expect(output.map((debt) => debt.dueDate.toISOString().slice(0, 10))).toEqual([
      '2026-08-29',
      '2026-09-29',
      '2026-10-29',
      '2026-11-29',
    ]);
  });
});
