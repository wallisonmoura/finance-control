import { DebtRepository } from '../../domain/repositories/debt.repository';
import { DebtOutput } from '../dto/debt.output';
import { ListDebtsInput } from '../dto/list-debts.input';

export class ListDebtsUseCase {
  constructor(private readonly debtRepository: DebtRepository) {}

  async execute(input: ListDebtsInput): Promise<DebtOutput[]> {
    const debts = await this.debtRepository.findByUserId(input.userId);

    return [...debts]
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .map((debt) => debt.toJSON());
  }
}
