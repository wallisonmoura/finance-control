import { DebtAlreadyPaidError } from '../../domain/errors/debt-already-paid.error';
import { DebtNotFoundError } from '../../domain/errors/debt-not-found.error';
import { UnauthorizedDebtAccessError } from '../../domain/errors/unauthorized-debt-access.error';
import { DebtRepository } from '../../domain/repositories/debt.repository';
import { DeleteDebtInput } from '../dto/delete-debt.input';

export class DeleteDebtUseCase {
  constructor(private readonly debtRepository: DebtRepository) {}

  async execute(input: DeleteDebtInput): Promise<void> {
    const debt = await this.debtRepository.findById(input.id);

    if (!debt) {
      throw new DebtNotFoundError();
    }

    if (debt.userId !== input.userId) {
      throw new UnauthorizedDebtAccessError();
    }

    if (debt.isPaid()) {
      throw new DebtAlreadyPaidError();
    }

    await this.debtRepository.delete(debt.id);
  }
}
