import { DebtRepository } from '../../domain/repositories/debt.repository';
import { DebtOutput } from '../dto/debt.output';
import { ListPendingDebtsInput } from '../dto/list-pending-debts.input';

export class ListPendingDebtsUseCase {
  constructor(private readonly debtRepository: DebtRepository) {}

  async execute(input: ListPendingDebtsInput): Promise<DebtOutput[]> {
    const debts = await this.debtRepository.findPendingByUserId(input.userId);

    return [...debts]
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .map((debt) => debt.toJSON());
  }
}
