import { RegisterDebtUseCase } from '@/modules/debts/application/use-cases/register-debt.use-case';
import { InMemoryDebtRepository } from './fakes/in-memory-debt.repository';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';

describe('RegisterDebtUseCase', () => {
  let debtRepository: InMemoryDebtRepository;
  let sut: RegisterDebtUseCase;

  beforeEach(() => {
    debtRepository = new InMemoryDebtRepository();
    sut = new RegisterDebtUseCase(debtRepository);
  });

  it('should register a pending debt successfully', async () => {
    const dueDate = new Date('2026-04-20');

    const output = await sut.execute({
      userId: 'user-1',
      description: 'Parcela do carro',
      amount: 850,
      dueDate,
      type: DebtType.ONE_TIME,
      notes: 'Abril',
    });

    expect(output.id).toBeDefined();
    expect(output.userId).toBe('user-1');
    expect(output.description).toBe('Parcela do carro');
    expect(output.amount).toBe(850);
    expect(output.dueDate).toEqual(dueDate);
    expect(output.type).toBe(DebtType.ONE_TIME);
    expect(output.status).toBe(DebtStatus.PENDING);
    expect(output.notes).toBe('Abril');
    expect(output.paidAt).toBeNull();
    expect(output.paymentSource).toBeNull();

    expect(debtRepository.items).toHaveLength(1);
  });

  it('should register with notes null when not provided', async () => {
    const output = await sut.execute({
      userId: 'user-1',
      description: 'Conta de energia',
      amount: 120,
      dueDate: new Date('2026-04-25'),
      type: DebtType.RECURRING,
    });

    expect(output.notes).toBeNull();
    expect(output.paidAt).toBeNull();
    expect(output.paymentSource).toBeNull();
  });
});
