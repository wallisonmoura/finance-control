import { randomUUID } from 'node:crypto';
import { Debt } from '../../domain/entities/debt.entity';
import { DebtRepository } from '../../domain/repositories/debt.repository';
import { DebtStatus } from '../../domain/enums/debt-status.enum';
import { DebtType } from '../../domain/enums/debt-type.enum';
import { buildInstallmentSchedule } from '../../domain/services/build-installment-schedule';
import { DebtOutput } from '../dtos/debt.output';
import { RegisterInstallmentDebtInput } from '../dtos/register-installment-debt.input';

function formatInstallmentNotes(
  userNotes: string | null | undefined,
  installmentNumber: number,
  installmentCount: number,
): string {
  const label = `Parcela ${String(installmentNumber).padStart(2, '0')}/${String(
    installmentCount,
  ).padStart(2, '0')}`;

  return userNotes ? `${userNotes} — ${label}` : label;
}

export class RegisterInstallmentDebtUseCase {
  constructor(private readonly debtRepository: DebtRepository) {}

  async execute(input: RegisterInstallmentDebtInput): Promise<DebtOutput[]> {
    const schedule = buildInstallmentSchedule(
      input.amount,
      input.installmentCount,
      input.dueDate,
    );

    const now = new Date();
    const createdDebts: DebtOutput[] = [];

    for (const [index, installment] of schedule.entries()) {
      const debt = Debt.create({
        id: randomUUID(),
        userId: input.userId,
        description: input.description,
        amount: installment.amount,
        dueDate: installment.dueDate,
        type: DebtType.RECURRING,
        status: DebtStatus.PENDING,
        notes: formatInstallmentNotes(input.notes, index + 1, schedule.length),
        paidAt: null,
        paymentSource: null,
        createdAt: now,
        updatedAt: now,
      });

      const createdDebt = await this.debtRepository.create(debt);
      createdDebts.push(createdDebt.toJSON());
    }

    return createdDebts;
  }
}
