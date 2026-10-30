import { randomUUID } from 'node:crypto';
import { Debt } from '../../domain/entities/debt.entity';
import { DebtRepository } from '../../domain/repositories/debt.repository';
import { DebtOutput } from '../dtos/debt.output';
import { RegisterDebtInput } from '../dtos/register-debt.input';
import { DebtStatus } from '../../domain/enums/debt-status.enum';
import { DebtType } from '../../domain/enums/debt-type.enum';
import { InstallmentDebtCreationNotAllowedError } from '../../domain/errors/installment-debt-creation-not-allowed.error';

export class RegisterDebtUseCase {
  constructor(private readonly debtRepository: DebtRepository) {}

  async execute(input: RegisterDebtInput): Promise<DebtOutput> {
    // Installments are created all at once by RegisterInstallmentDebtUseCase.
    if (input.type === DebtType.INSTALLMENT) {
      throw new InstallmentDebtCreationNotAllowedError();
    }

    const now = new Date();

    const debt = Debt.create({
      id: randomUUID(),
      userId: input.userId,
      description: input.description,
      amount: input.amount,
      dueDate: input.dueDate,
      type: input.type,
      status: DebtStatus.PENDING,
      notes: input.notes ?? null,
      paidAt: null,
      paymentSource: null,
      createdAt: now,
      updatedAt: now,
    });

    const createdDebt = await this.debtRepository.create(debt);

    return createdDebt.toJSON();
  }
}
