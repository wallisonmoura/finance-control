import { withTransaction } from '@/shared/infra/database/prisma/with-transaction';
import { RegisterInstallmentDebtInput } from '../../application/dtos/register-installment-debt.input';
import { DebtOutput } from '../../application/dtos/debt.output';
import { RegisterInstallmentDebtUseCase } from '../../application/use-cases/register-installment-debt.use-case';
import { PrismaDebtRepository } from '../repositories/prisma-debt.repository';

export function makeRegisterInstallmentDebtUseCase(): Pick<
  RegisterInstallmentDebtUseCase,
  'execute'
> {
  return {
    execute: (input: RegisterInstallmentDebtInput): Promise<DebtOutput[]> =>
      withTransaction((tx) => {
        const debtRepository = new PrismaDebtRepository(tx);
        const registerInstallmentDebtUseCase = new RegisterInstallmentDebtUseCase(
          debtRepository,
        );

        return registerInstallmentDebtUseCase.execute(input);
      }),
  };
}
