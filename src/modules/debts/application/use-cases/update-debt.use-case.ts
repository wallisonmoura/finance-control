import { DebtNotFoundError } from '../../domain/errors/debt-not-found.error';
import { UnauthorizedDebtAccessError } from '../../domain/errors/unauthorized-debt-access.error';
import { DebtRepository } from '../../domain/repositories/debt.repository';
import { DebtOutput } from '../dtos/debt.output';
import { UpdateDebtInput } from '../dtos/update-debt.input';

export class UpdateDebtUseCase {
  constructor(private readonly debtRepository: DebtRepository) {}

  async execute(input: UpdateDebtInput): Promise<DebtOutput> {
    const debt = await this.debtRepository.findById(input.id);

    if (!debt) {
      throw new DebtNotFoundError();
    }

    if (debt.userId !== input.userId) {
      throw new UnauthorizedDebtAccessError();
    }

    const updatedDebt = debt.update({
      description: input.description,
      amount: input.amount,
      dueDate: input.dueDate,
      type: input.type,
      notes: input.notes,
    });

    const savedDebt = await this.debtRepository.update(updatedDebt);

    return savedDebt.toJSON();
  }
}
